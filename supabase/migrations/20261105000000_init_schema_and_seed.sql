-- ============================================================================
-- fun-fishing (rigs) MVP Database Schema & 40 Curated Items Seed Data
-- Target: Offshore Big Game Casting (Bluefin Tuna / Kingfish)
-- Database: Supabase (PostgreSQL 15+)
-- ============================================================================

-- 1. Clean up existing objects if re-running
DROP FUNCTION IF EXISTS evaluate_tackle_compatibility(UUID, UUID, UUID, UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS upsert_gear_from_ai_json(JSONB) CASCADE;
DROP TABLE IF EXISTS spec_lures CASCADE;
DROP TABLE IF EXISTS spec_lines CASCADE;
DROP TABLE IF EXISTS spec_rods CASCADE;
DROP TABLE IF EXISTS spec_reels CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TYPE IF EXISTS lure_sub_type CASCADE;
DROP TYPE IF EXISTS line_sub_type CASCADE;
DROP TYPE IF EXISTS gear_category CASCADE;

-- 2. ENUM Definitions
CREATE TYPE gear_category AS ENUM ('reel', 'rod', 'line', 'lure');
CREATE TYPE line_sub_type AS ENUM ('pe_main', 'leader_sub');
CREATE TYPE lure_sub_type AS ENUM ('plug_main', 'hook_ring_sub');

-- 3. Master Catalog Table (products)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    category gear_category NOT NULL,
    brand TEXT NOT NULL,
    model_name TEXT NOT NULL,
    price_jpy INTEGER NOT NULL CHECK (price_jpy >= 0),
    in_stock BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    expert_note TEXT NOT NULL,
    raw_ai_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- 4. Category Spec Tables
-- [01 REEL] (4 items)
CREATE TABLE spec_reels (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    size_class INTEGER NOT NULL,               -- 14000, 18000, 20000
    weight_g INTEGER NOT NULL,                 -- 自重 (g)
    gear_ratio NUMERIC(3,1) NOT NULL,          -- ギア比
    retrieve_cm INTEGER NOT NULL,              -- 最大巻上長 (cm/ハンドル1回転)
    practical_drag_kg NUMERIC(4,1) NOT NULL,   -- 実用ドラグ力 (kg)
    max_drag_kg NUMERIC(4,1) NOT NULL,         -- 最大ドラグ力 (kg)
    pe_capacity_map JSONB NOT NULL             -- 号数別糸巻き量(m): e.g. '{"6": 300, "8": 200}'
);

-- [02 ROD] (12 items)
CREATE TABLE spec_rods (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    length_ft_in TEXT NOT NULL,                -- 表記全長: e.g. '8''2"'
    length_cm INTEGER NOT NULL,                -- 全長 (cm)
    weight_g INTEGER NOT NULL,                 -- 自重 (g)
    lure_min_g INTEGER NOT NULL,               -- 適合ルアー下限 (g)
    lure_max_g INTEGER NOT NULL,               -- 適合ルアー上限 (g)
    lure_sweet_min_g INTEGER NOT NULL,         -- 最適ルアー下限 (g)
    lure_sweet_max_g INTEGER NOT NULL,         -- 最適ルアー上限 (g)
    min_pe NUMERIC(3,1) NOT NULL,              -- 適合PE下限 (号)
    max_pe NUMERIC(3,1) NOT NULL,              -- 適合PE上限 (号)
    max_drag_kg NUMERIC(4,1) NOT NULL,         -- 最大ドラグ負荷 (kg / 45°)
    compatible_reel_sizes INTEGER[] NOT NULL   -- 適合リール番手配列: e.g. '{14000}'
);

-- [03 LINE] (10 items: 6 PE Main + 4 Shock Leader Sub)
CREATE TABLE spec_lines (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    sub_type line_sub_type NOT NULL,
    pe_number NUMERIC(3,1),                    -- PEメイン時: 号数 (6.0, 8.0, 10.0, 12.0)
    length_m INTEGER NOT NULL,                 -- 巻き量 (m)
    strength_lb INTEGER NOT NULL,              -- 直線強力 (lb)
    default_sub_leader_sku TEXT,               -- PE選択時に自動セットされる推奨リーダーSKU
    compatible_pe_min NUMERIC(3,1),            -- リーダー時: 適合PE下限
    compatible_pe_max NUMERIC(3,1)             -- リーダー時: 適合PE上限
);

-- [04 LURE] (14 items: 8 Diving Pencil/Popper Main + 6 Hook & Ring Set Sub)
CREATE TABLE spec_lures (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    sub_type lure_sub_type NOT NULL,
    length_mm INTEGER,                         -- プラグ全長 (mm)
    weight_g NUMERIC(5,1) NOT NULL,            -- プラグ単体重量(g) または フック+リング総重量(g)
    hook_code TEXT NOT NULL,                   -- 適合規格クラス: 'CLASS_3_0', 'CLASS_4_0', 'CLASS_5_0'
    default_sub_hook_sku TEXT,                 -- プラグ選択時に自動セットされる推奨フック&リングSKU
    min_pe NUMERIC(3,1) NOT NULL DEFAULT 5.0   -- 推奨最低PE号数
);

-- ============================================================================
-- 5. Row Level Security (RLS) Policies (Public Read for Catalog)
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_rods ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_lures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on spec_reels" ON spec_reels FOR SELECT USING (true);
CREATE POLICY "Allow public read access on spec_rods" ON spec_rods FOR SELECT USING (true);
CREATE POLICY "Allow public read access on spec_lines" ON spec_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read access on spec_lures" ON spec_lures FOR SELECT USING (true);

-- ============================================================================
-- 6. AI Autonomous Operation RPC: Upsert Single JSON Payload
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_gear_from_ai_json(payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id UUID;
    v_category gear_category;
    v_specs JSONB;
BEGIN
    v_category := (payload ->> 'category')::gear_category;
    v_specs := payload -> 'specs';

    INSERT INTO products (sku, category, brand, model_name, price_jpy, in_stock, image_url, expert_note, raw_ai_json, updated_at)
    VALUES (
        payload ->> 'sku',
        v_category,
        payload ->> 'brand',
        payload ->> 'model_name',
        (payload ->> 'price_jpy')::INTEGER,
        COALESCE((payload ->> 'in_stock')::BOOLEAN, true),
        payload ->> 'image_url',
        COALESCE(payload ->> 'expert_note', ''),
        payload,
        now()
    )
    ON CONFLICT (sku) DO UPDATE SET
        brand = EXCLUDED.brand,
        model_name = EXCLUDED.model_name,
        price_jpy = EXCLUDED.price_jpy,
        in_stock = EXCLUDED.in_stock,
        expert_note = EXCLUDED.expert_note,
        raw_ai_json = EXCLUDED.raw_ai_json,
        updated_at = now()
    RETURNING id INTO v_product_id;

    IF v_category = 'reel' THEN
        INSERT INTO spec_reels (product_id, size_class, weight_g, gear_ratio, retrieve_cm, practical_drag_kg, max_drag_kg, pe_capacity_map)
        VALUES (
            v_product_id,
            (v_specs ->> 'size_class')::INTEGER,
            (v_specs ->> 'weight_g')::INTEGER,
            (v_specs ->> 'gear_ratio')::NUMERIC,
            (v_specs ->> 'retrieve_cm')::INTEGER,
            (v_specs ->> 'practical_drag_kg')::NUMERIC,
            (v_specs ->> 'max_drag_kg')::NUMERIC,
            v_specs -> 'pe_capacity_map'
        )
        ON CONFLICT (product_id) DO UPDATE SET
            size_class = EXCLUDED.size_class,
            weight_g = EXCLUDED.weight_g,
            gear_ratio = EXCLUDED.gear_ratio,
            retrieve_cm = EXCLUDED.retrieve_cm,
            practical_drag_kg = EXCLUDED.practical_drag_kg,
            max_drag_kg = EXCLUDED.max_drag_kg,
            pe_capacity_map = EXCLUDED.pe_capacity_map;
    ELSIF v_category = 'rod' THEN
        INSERT INTO spec_rods (product_id, length_ft_in, length_cm, weight_g, lure_min_g, lure_max_g, lure_sweet_min_g, lure_sweet_max_g, min_pe, max_pe, max_drag_kg, compatible_reel_sizes)
        VALUES (
            v_product_id,
            v_specs ->> 'length_ft_in',
            (v_specs ->> 'length_cm')::INTEGER,
            (v_specs ->> 'weight_g')::INTEGER,
            (v_specs ->> 'lure_min_g')::INTEGER,
            (v_specs ->> 'lure_max_g')::INTEGER,
            (v_specs ->> 'lure_sweet_min_g')::INTEGER,
            (v_specs ->> 'lure_sweet_max_g')::INTEGER,
            (v_specs ->> 'min_pe')::NUMERIC,
            (v_specs ->> 'max_pe')::NUMERIC,
            (v_specs ->> 'max_drag_kg')::NUMERIC,
            ARRAY(SELECT jsonb_array_elements_text(v_specs -> 'compatible_reel_sizes')::INTEGER)
        )
        ON CONFLICT (product_id) DO UPDATE SET
            length_ft_in = EXCLUDED.length_ft_in,
            length_cm = EXCLUDED.length_cm,
            weight_g = EXCLUDED.weight_g,
            lure_min_g = EXCLUDED.lure_min_g,
            lure_max_g = EXCLUDED.lure_max_g,
            lure_sweet_min_g = EXCLUDED.lure_sweet_min_g,
            lure_sweet_max_g = EXCLUDED.lure_sweet_max_g,
            min_pe = EXCLUDED.min_pe,
            max_pe = EXCLUDED.max_pe,
            max_drag_kg = EXCLUDED.max_drag_kg,
            compatible_reel_sizes = EXCLUDED.compatible_reel_sizes;
    END IF;

    RETURN v_product_id;
END;
$$;

-- ============================================================================
-- 7. Tackle Compatibility Evaluation RPC Function (if/then engine in SQL)
-- ============================================================================
CREATE OR REPLACE FUNCTION evaluate_tackle_compatibility(
    p_reel_id UUID,
    p_rod_id UUID,
    p_pe_id UUID,
    p_leader_id UUID,
    p_plug_id UUID,
    p_hook_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_reel spec_reels%ROWTYPE;
    v_rod spec_rods%ROWTYPE;
    v_pe spec_lines%ROWTYPE;
    v_leader spec_lines%ROWTYPE;
    v_plug spec_lures%ROWTYPE;
    v_hook spec_lures%ROWTYPE;
    v_reel_cap_m INTEGER;
    v_fill_ratio NUMERIC;
    v_total_lure_g NUMERIC;
    v_issues TEXT[] := ARRAY[]::TEXT[];
    v_score INTEGER := 100;
BEGIN
    IF p_reel_id IS NOT NULL THEN SELECT * INTO v_reel FROM spec_reels WHERE product_id = p_reel_id; END IF;
    IF p_rod_id IS NOT NULL THEN SELECT * INTO v_rod FROM spec_rods WHERE product_id = p_rod_id; END IF;
    IF p_pe_id IS NOT NULL THEN SELECT * INTO v_pe FROM spec_lines WHERE product_id = p_pe_id; END IF;
    IF p_leader_id IS NOT NULL THEN SELECT * INTO v_leader FROM spec_lines WHERE product_id = p_leader_id; END IF;
    IF p_plug_id IS NOT NULL THEN SELECT * INTO v_plug FROM spec_lures WHERE product_id = p_plug_id; END IF;
    IF p_hook_id IS NOT NULL THEN SELECT * INTO v_hook FROM spec_lures WHERE product_id = p_hook_id; END IF;

    -- Check 1: Reel x Rod size class
    IF v_reel.product_id IS NOT NULL AND v_rod.product_id IS NOT NULL THEN
        IF NOT (v_reel.size_class = ANY(v_rod.compatible_reel_sizes)) THEN
            v_issues := array_append(v_issues, format('リール番手(%s番)がロッド推奨番手(%s)と不適合', v_reel.size_class, array_to_string(v_rod.compatible_reel_sizes, '/')));
            v_score := v_score - 50;
        END IF;
    END IF;

    -- Check 2: Reel x PE Line spool capacity
    IF v_reel.product_id IS NOT NULL AND v_pe.product_id IS NOT NULL AND v_pe.pe_number IS NOT NULL THEN
        v_reel_cap_m := COALESCE(
            (v_reel.pe_capacity_map ->> trim(trailing '.0' from v_pe.pe_number::text))::INTEGER,
            (v_reel.pe_capacity_map ->> v_pe.pe_number::text)::INTEGER
        );
        IF v_reel_cap_m IS NULL THEN
            v_issues := array_append(v_issues, format('PE %s号は選択リールの推奨スプール糸巻き量規格外', trim(trailing '.0' from v_pe.pe_number::text)));
            v_score := v_score - 50;
        ELSE
            v_fill_ratio := v_pe.length_m::NUMERIC / v_reel_cap_m::NUMERIC;
            IF v_fill_ratio > 1.0 THEN
                v_issues := array_append(v_issues, format('スプール容量超過: PE%s号の最大格納量%smに対し%smは巻ききれません', trim(trailing '.0' from v_pe.pe_number::text), v_reel_cap_m, v_pe.length_m));
                v_score := v_score - 50;
            ELSIF v_fill_ratio < 0.85 THEN
                v_issues := array_append(v_issues, format('糸巻き量不足: 容量%smに対し%sm（下巻き必須）', v_reel_cap_m, v_pe.length_m));
                v_score := v_score - 20;
            END IF;
        END IF;
    END IF;

    -- Check 3: Rod x PE Line rating
    IF v_rod.product_id IS NOT NULL AND v_pe.product_id IS NOT NULL AND v_pe.pe_number IS NOT NULL THEN
        IF v_pe.pe_number > v_rod.max_pe THEN
            v_issues := array_append(v_issues, format('ライン号数超過: ロッド上限(MAX PE%s)に対しPE%s号はブランクス破損リスクあり', trim(trailing '.0' from v_rod.max_pe::text), trim(trailing '.0' from v_pe.pe_number::text)));
            v_score := v_score - 50;
        ELSIF v_pe.pe_number < v_rod.min_pe THEN
            v_issues := array_append(v_issues, format('ライン強度不足: ロッド推奨下限(PE%s号)未満のため高負荷時に高切れリスクあり', trim(trailing '.0' from v_rod.min_pe::text)));
            v_score := v_score - 35;
        END IF;
    END IF;

    -- Check 4: PE Line x Shock Leader balance
    IF v_pe.product_id IS NOT NULL AND v_leader.product_id IS NOT NULL AND v_pe.pe_number IS NOT NULL THEN
        IF v_pe.pe_number < v_leader.compatible_pe_min OR v_pe.pe_number > v_leader.compatible_pe_max THEN
            v_issues := array_append(v_issues, format('リーダー号数不適合: PE%s号に対してリーダー%slbは結束バランス範囲外', trim(trailing '.0' from v_pe.pe_number::text), v_leader.strength_lb));
            v_score := v_score - 30;
        END IF;
    END IF;

    -- Check 5: Plug x Hook class match & Rod x Total Lure Weight (Body + Hook)
    IF v_plug.product_id IS NOT NULL THEN
        v_total_lure_g := v_plug.weight_g + COALESCE(v_hook.weight_g, 0);
        IF v_hook.product_id IS NOT NULL AND v_plug.hook_code <> v_hook.hook_code THEN
            v_issues := array_append(v_issues, format('フック規格不一致: ルアー浮力設計(%s)とフック重量規格(%s)が不一致', v_plug.hook_code, v_hook.hook_code));
            v_score := v_score - 40;
        END IF;

        IF v_rod.product_id IS NOT NULL THEN
            IF v_total_lure_g > v_rod.lure_max_g THEN
                v_issues := array_append(v_issues, format('ルアー総重量超過: フック装着時の総重量(%sg)がロッド上限(%sg)を%sg超過', v_total_lure_g, v_rod.lure_max_g, v_total_lure_g - v_rod.lure_max_g));
                v_score := v_score - 50;
            ELSIF v_total_lure_g < v_rod.lure_min_g THEN
                v_issues := array_append(v_issues, format('ルアー総重量不足: 総重量(%sg)がロッド下限(%sg)未満のためティップが曲がらず飛距離低下', v_total_lure_g, v_rod.lure_min_g));
                v_score := v_score - 35;
            END IF;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'is_compatible', (array_length(v_issues, 1) IS NULL),
        'compatibility_score', GREATEST(v_score, 0),
        'total_lure_weight_g', v_total_lure_g,
        'issues', v_issues
    );
END;
$$;

-- ============================================================================
-- 8. Seed Data: 40 Curated Offshore Big Game Items
-- ============================================================================

-- [1/4] REEL (4 Items)
WITH ins_reels AS (
    INSERT INTO products (sku, category, brand, model_name, price_jpy, expert_note) VALUES
    ('REEL-SHIMANO-19STELLA-14000XG', 'reel', 'SHIMANO', '19 STELLA SW 14000XG', 119300, 'PE6号-300m基準のヒラマサ・近海マグロの業界標準機。134cmの巻上長でダイビングペンシルのスラック処理を高速化。'),
    ('REEL-DAIWA-20SALTIGA-14000XH', 'reel', 'DAIWA', '20 SALTIGA 14000-XH', 119900, 'モノコックボディによりPE6号-300mに加えPE8号-250mの格納を実現。初動ドラグの滑らかさで細軸フックの身切れを防ぐ。'),
    ('REEL-SHIMANO-20STELLA-18000HG', 'reel', 'SHIMANO', '20 STELLA SW 18000HG', 130900, 'PE8号-300m格納。50kg超のクロマグロおよび20kg超のオオマサを強引に根から剥がすハイギア・高剛性モデル。'),
    ('REEL-DAIWA-20SALTIGA-20000H', 'reel', 'DAIWA', '20 SALTIGA 20000-H', 141900, 'PE10号-300m / PE12号-250m格納。100kg超のクロマグロと長時間対峙するための放熱ドラグと143cmの巻上長を備える。')
    RETURNING id, sku
)
INSERT INTO spec_reels (product_id, size_class, weight_g, gear_ratio, retrieve_cm, practical_drag_kg, max_drag_kg, pe_capacity_map)
SELECT id,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 14000
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 14000
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 18000
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 20000
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 675
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 665
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 875
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 890
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 6.2
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 6.2
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 5.7
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 5.8
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 134
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 134
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 129
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 143
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 18.0
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 18.0
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 17.0
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 20.0
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN 25.0
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN 25.0
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN 28.0
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN 30.0
    END,
    CASE sku
        WHEN 'REEL-SHIMANO-19STELLA-14000XG' THEN '{"6": 300, "8": 200}'::jsonb
        WHEN 'REEL-DAIWA-20SALTIGA-14000XH'  THEN '{"6": 300, "8": 250}'::jsonb
        WHEN 'REEL-SHIMANO-20STELLA-18000HG' THEN '{"8": 300, "10": 200}'::jsonb
        WHEN 'REEL-DAIWA-20SALTIGA-20000H'   THEN '{"10": 300, "12": 250}'::jsonb
    END
FROM ins_reels;

-- [2/4] ROD (12 Items)
WITH ins_rods AS (
    INSERT INTO products (sku, category, brand, model_name, price_jpy, expert_note) VALUES
    ('ROD-RF-AQUILA-MLT82-3-6', 'rod', 'Ripple Fisher', 'Aquila MLT 82-3/6', 89100, '326gの軽量ブランクスで180〜200mmプラグを1日中振り抜ける。PE6号で10〜20kgのヒラマサ・キハダを獲る中核モデル。'),
    ('ROD-RF-AQUILA-MST82-9PLUS', 'rod', 'Ripple Fisher', 'Aquila MST 82-9+', 93500, '14000番のPE8号-200m設定から18000番まで対応。シャロー帯の大型ヒラマサを強引に止めるバットパワー。'),
    ('ROD-RF-ULTIMO-83M-NANO', 'rod', 'Ripple Fisher', 'Ultimo 83M Nano', 96800, 'ナノアロイ採用の高反発ブランクス。向かい風でも70〜100gのダイビングペンシルを圧倒的な初速で飛ばす。'),
    ('ROD-MC-EXPLOSION-826HF', 'rod', 'MC works', 'EXPLOSION 826HF-TRIDENT', 85800, '3ピース構造で遠征の携行性を確保しつつ、PE6号で60〜100gプラグを繊細にダイブさせるティップを持つ。'),
    ('ROD-SHIMANO-OCEA-BG-S83H', 'rod', 'SHIMANO', 'OCEA PLUGGER BG FLEX ENERGY S83H', 86900, '60度曲げ強度に優れ、船べりでの急な突っ込みでもアングラーの体幹負荷を軽減する粘り重視の設計。'),
    ('ROD-DAIWA-SALTIGA-C-82-6', 'rod', 'DAIWA', 'SALTIGA C 82-6', 84700, '160〜200mmプラグの操作性に特化。14000番リール装着時の手元重心が極めて軽い。'),
    ('ROD-RF-BIGTUNA-85F-JP', 'rod', 'Ripple Fisher', 'BIG TUNA 85F JAPAN Special', 97900, 'PE8〜10号の太糸を使いながら、イワシパターンの小型プラグ(60〜85g)をナブラへ届ける唯一無二のクロマグロ専用竿。'),
    ('ROD-RF-BIGTUNA-83-JP', 'rod', 'Ripple Fisher', 'BIG TUNA 83 JAPAN Special', 97900, '50〜100kgクラスのクロマグロ標準機。100〜150gの大型プラグを投げ続けられ、立ててファイトできる支点設計。'),
    ('ROD-RF-BIGTUNA-76-JP', 'rod', 'Ripple Fisher', 'BIG TUNA 76 JAPAN Special', 99000, '100kg超モンスター対応のショートレングス。高ドラグ(15kg+)での長時間リフトでもアングラーが主導権を握れる。'),
    ('ROD-MC-SLOWHAND-817PD', 'rod', 'MC works', 'SLOW HAND 817PD', 83600, '低反発ブランクスにより、PE8〜10号の高負荷ファイト時にもアングラーの腰への衝撃を吸収する対マグロモデル。'),
    ('ROD-SHIMANO-OCEA-MD-S86H3', 'rod', 'SHIMANO', 'OCEA PLUGGER BG MONSTER DRIVE S86H-3', 89100, '8ft6inのロングレングスでPE8号使用時の飛距離不足を補い、大型ベイトパターンの120〜160gプラグを遠投する。'),
    ('ROD-DAIWA-SALTIGA-C-83-10', 'rod', 'DAIWA', 'SALTIGA C 83-10', 89100, 'ソルティガ20000-Hとの組み合わせでPE10号・ドラグ15kg超の実戦ファイトを想定したヘビーデューティ仕様。')
    RETURNING id, sku
)
INSERT INTO spec_rods (product_id, length_ft_in, length_cm, weight_g, lure_min_g, lure_max_g, lure_sweet_min_g, lure_sweet_max_g, min_pe, max_pe, max_drag_kg, compatible_reel_sizes)
SELECT id,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN '8''2"'
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN '8''2"'
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN '8''3"'
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN '8''2"'
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN '8''3"'
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN '8''2"'
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN '8''5"'
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN '8''3"'
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN '7''6"'
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN '8''1"'
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN '8''6"'
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN '8''3"'
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 249
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 249
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 252
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 249
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 251
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 249
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 257
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 252
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 229
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 246
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 259
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 251
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 326
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 398
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 365
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 375
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 407
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 355
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 390
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 421
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 448
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 425
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 425
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 435
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 40
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 40
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 50
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 40
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 50
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 45
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 18
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 40
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 60
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 70
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 60
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 70
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 110
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 160
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 120
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 120
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 150
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 130
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 120
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 160
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 180
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 180
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 160
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 180
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 60
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 75
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 70
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 65
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 75
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 65
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 50
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 80
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 95
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 95
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 85
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 100
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 95
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 135
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 105
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 105
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 125
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 105
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 100
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 140
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 160
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 155
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 140
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 155
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 4.0
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 6.0
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 5.0
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 5.0
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 5.0
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 5.0
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 6.0
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 8.0
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 8.0
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 7.0
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 6.0
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 8.0
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 6.0
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 9.0
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 6.0
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 8.0
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 8.0
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 6.0
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 12.0
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 12.0
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 12.0
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 10.0
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 8.0
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 10.0
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN 11.0
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN 15.0
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN 12.0
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN 15.0
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN 14.0
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN 12.0
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN 15.0
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN 18.0
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN 18.0
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN 18.0
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN 14.0
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN 18.0
    END,
    CASE sku
        WHEN 'ROD-RF-AQUILA-MLT82-3-6'   THEN ARRAY[14000]
        WHEN 'ROD-RF-AQUILA-MST82-9PLUS' THEN ARRAY[14000, 18000]
        WHEN 'ROD-RF-ULTIMO-83M-NANO'    THEN ARRAY[14000]
        WHEN 'ROD-MC-EXPLOSION-826HF'    THEN ARRAY[14000]
        WHEN 'ROD-SHIMANO-OCEA-BG-S83H'  THEN ARRAY[14000, 18000]
        WHEN 'ROD-DAIWA-SALTIGA-C-82-6'  THEN ARRAY[14000]
        WHEN 'ROD-RF-BIGTUNA-85F-JP'     THEN ARRAY[18000, 20000]
        WHEN 'ROD-RF-BIGTUNA-83-JP'      THEN ARRAY[18000, 20000]
        WHEN 'ROD-RF-BIGTUNA-76-JP'      THEN ARRAY[18000, 20000]
        WHEN 'ROD-MC-SLOWHAND-817PD'     THEN ARRAY[18000, 20000]
        WHEN 'ROD-SHIMANO-OCEA-MD-S86H3' THEN ARRAY[14000, 18000]
        WHEN 'ROD-DAIWA-SALTIGA-C-83-10' THEN ARRAY[18000, 20000]
    END
FROM ins_rods;

-- [3/4] LINE (10 Items: 6 PE Main + 4 Leader Sub)
WITH ins_lines AS (
    INSERT INTO products (sku, category, brand, model_name, price_jpy, expert_note) VALUES
    ('LINE-VARIVAS-SMP-PE6-300', 'line', 'VARIVAS', 'Avani Casting PE SMP 6号 300m', 12100, 'ステラ/ソルティガ14000番に下巻きなしで100%格納。ガイド摩擦に強く、数日間の遠征でも毛羽立ちにくい定番ライン。'),
    ('LINE-YGK-ODDPORT-PE6-300', 'line', 'YGK', 'ODDPORT WXP1 8 6号 300m', 13200, '高密度組構造により6号で100lbの直線強力を発揮。シャローのヒラマサ戦で根ズレ破断を最小限に抑える。'),
    ('LINE-VARIVAS-SMP-PE8-200', 'line', 'VARIVAS', 'Avani Casting PE SMP 8号 200m', 9680, '14000番スプールにPE8号をジャスト200m巻くための専用規格。14000番の軽快さのまま太糸でオオマサに挑むセッティング。'),
    ('LINE-VARIVAS-SIX-PE8-300', 'line', 'VARIVAS', 'Avani Casting PE Si-X 8号 300m', 14300, 'ステラ18000HGに100%格納。特殊耐熱素材Si-Xにより、マグロのファーストラン時の摩擦熱によるラインブレイクを防ぐ。'),
    ('LINE-VARIVAS-SIX-PE10-300', 'line', 'VARIVAS', 'Avani Casting PE Si-X 10号 300m', 15400, 'ソルティガ20000-Hに100%格納。70〜100kg超のクロマグロに対してドラグ12〜15kgを掛け続けるための耐熱8本撚り。'),
    ('LINE-YGK-ODDPORT-PE12-250', 'line', 'YGK', 'ODDPORT WXP1 8 12号 250m', 16500, 'ソルティガ20000-Hの12号枠(250m)に完全一致。100kgオーバーのクロマグロを規制ルール内で迅速にキャッチするための最終兵器。'),
    ('LEADER-VARIVAS-OR-120LB', 'line', 'VARIVAS', 'Ocean Record Shock Leader 120lb (35号) 50m', 4180, 'PE6号とのFG/PRノット結束で最もバランスが良く、180mmクラスのダイビングペンシルのアクションを殺さないしなやかさ。'),
    ('LEADER-VARIVAS-OR-140LB', 'line', 'VARIVAS', 'Ocean Record Shock Leader 140lb (40号) 50m', 4400, 'PE6〜8号に対応。瀬際でのヒラマサの反転や、キハダ・中型マグロの魚体擦れに耐える基準リーダー。'),
    ('LEADER-VARIVAS-OR-180LB', 'line', 'VARIVAS', 'Ocean Record Shock Leader 180lb (50号) 50m', 4620, 'PE8〜10号のクロマグロ仕様に必須。太軸フック装着プラグの激しいジャークでもノット部の強度低下が少ない。'),
    ('LEADER-VARIVAS-OR-220LB', 'line', 'VARIVAS', 'Ocean Record Shock Leader 220lb (60号) 30m', 4840, 'PE10〜12号専用。100kg超クロマグロの歯・尾ビレ擦れに耐え抜く極太ナイロンリーダー。')
    RETURNING id, sku
)
INSERT INTO spec_lines (product_id, sub_type, pe_number, length_m, strength_lb, default_sub_leader_sku, compatible_pe_min, compatible_pe_max)
SELECT id,
    CASE WHEN sku LIKE 'LINE-%' THEN 'pe_main'::line_sub_type ELSE 'leader_sub'::line_sub_type END,
    CASE sku
        WHEN 'LINE-VARIVAS-SMP-PE6-300'  THEN 6.0
        WHEN 'LINE-YGK-ODDPORT-PE6-300'  THEN 6.0
        WHEN 'LINE-VARIVAS-SMP-PE8-200'  THEN 8.0
        WHEN 'LINE-VARIVAS-SIX-PE8-300'  THEN 8.0
        WHEN 'LINE-VARIVAS-SIX-PE10-300' THEN 10.0
        WHEN 'LINE-YGK-ODDPORT-PE12-250' THEN 12.0
        ELSE NULL
    END,
    CASE sku
        WHEN 'LINE-VARIVAS-SMP-PE6-300'  THEN 300
        WHEN 'LINE-YGK-ODDPORT-PE6-300'  THEN 300
        WHEN 'LINE-VARIVAS-SMP-PE8-200'  THEN 200
        WHEN 'LINE-VARIVAS-SIX-PE8-300'  THEN 300
        WHEN 'LINE-VARIVAS-SIX-PE10-300' THEN 300
        WHEN 'LINE-YGK-ODDPORT-PE12-250' THEN 250
        WHEN 'LEADER-VARIVAS-OR-220LB'   THEN 30
        ELSE 50
    END,
    CASE sku
        WHEN 'LINE-VARIVAS-SMP-PE6-300'  THEN 90
        WHEN 'LINE-YGK-ODDPORT-PE6-300'  THEN 100
        WHEN 'LINE-VARIVAS-SMP-PE8-200'  THEN 120
        WHEN 'LINE-VARIVAS-SIX-PE8-300'  THEN 115
        WHEN 'LINE-VARIVAS-SIX-PE10-300' THEN 140
        WHEN 'LINE-YGK-ODDPORT-PE12-250' THEN 170
        WHEN 'LEADER-VARIVAS-OR-120LB'   THEN 120
        WHEN 'LEADER-VARIVAS-OR-140LB'   THEN 140
        WHEN 'LEADER-VARIVAS-OR-180LB'   THEN 180
        WHEN 'LEADER-VARIVAS-OR-220LB'   THEN 220
    END,
    CASE sku
        WHEN 'LINE-VARIVAS-SMP-PE6-300'  THEN 'LEADER-VARIVAS-OR-120LB'
        WHEN 'LINE-YGK-ODDPORT-PE6-300'  THEN 'LEADER-VARIVAS-OR-140LB'
        WHEN 'LINE-VARIVAS-SMP-PE8-200'  THEN 'LEADER-VARIVAS-OR-140LB'
        WHEN 'LINE-VARIVAS-SIX-PE8-300'  THEN 'LEADER-VARIVAS-OR-180LB'
        WHEN 'LINE-VARIVAS-SIX-PE10-300' THEN 'LEADER-VARIVAS-OR-180LB'
        WHEN 'LINE-YGK-ODDPORT-PE12-250' THEN 'LEADER-VARIVAS-OR-220LB'
        ELSE NULL
    END,
    CASE sku
        WHEN 'LEADER-VARIVAS-OR-120LB' THEN 5.0
        WHEN 'LEADER-VARIVAS-OR-140LB' THEN 6.0
        WHEN 'LEADER-VARIVAS-OR-180LB' THEN 8.0
        WHEN 'LEADER-VARIVAS-OR-220LB' THEN 10.0
        ELSE NULL
    END,
    CASE sku
        WHEN 'LEADER-VARIVAS-OR-120LB' THEN 6.0
        WHEN 'LEADER-VARIVAS-OR-140LB' THEN 8.0
        WHEN 'LEADER-VARIVAS-OR-180LB' THEN 10.0
        WHEN 'LEADER-VARIVAS-OR-220LB' THEN 12.0
        ELSE NULL
    END
FROM ins_lines;

-- [4/4] LURE (14 Items: 8 Plug Main + 6 Hook/Ring Sub)
WITH ins_lures AS (
    INSERT INTO products (sku, category, brand, model_name, price_jpy, expert_note) VALUES
    ('LURE-DCLAW-MARINO200-SLIM', 'lure', 'D-CLAW', 'MARINO 200 Slim', 8580, '本体61g。フック装着時約72.5gとなり、PE6号ロッドのスイートスポットど真ん中で強風下でも飛行姿勢が崩れない。'),
    ('LURE-DCLAW-BEACON180', 'lure', 'D-CLAW', 'BEACON 180', 8800, '本体70g。垂直浮きからのポッピング音と泡噛みで、沈んだキハダ・クロマグロを水面へ引きずり出す実績No.1ポッパー。'),
    ('LURE-SHIMANO-BETCHU-190F', 'lure', 'SHIMANO', '別注平政 190F フラッシュブースト', 3740, '本体73g。安定したダイブと内部反射板により、ステイ中もヒラマサ・マグロに視覚アピールを継続する。'),
    ('LURE-SHIMANO-BOMBDIP-170F', 'lure', 'SHIMANO', 'ボムディップ 170F フラッシュブースト', 3630, '本体72g。170mmのコンパクトシルエットながら72gの重量を持ち、BIG TUNA 85F等の太糸タックルでも飛距離を出せる。'),
    ('LURE-CBONE-ZORRO220', 'lure', 'CB ONE', 'ZORRO 220', 11000, '本体85g。フック込約101gとなり、Aquila 82-3/6(上限110g)で扱える最大級のウッドプラグ。緩やかなS字で食わせる。'),
    ('LURE-CBONE-BAZOO200', 'lure', 'CB ONE', 'BAZOO 200', 12100, '本体96gだが#4/0フック装着で総重量112gに達するため、上限110gのロッドでは重量超過となる点に注意。強波動で誘い出す。'),
    ('LURE-MARIA-RAPIDO-F230', 'lure', 'Maria', 'ラピード F230', 4290, '本体100g（フック込116g）。大型シイラ・サンマパターンのヒラマサ・マグロに必須の230mmサイズ。'),
    ('LURE-CBONE-RYAN230', 'lure', 'CB ONE', 'RYAN 230', 14300, '本体130g（#5/0フック込151g）。PE8〜12号のヘビータックルでのみ振り抜ける対モンスター専用ウッドプラグ。'),
    ('HOOK-ST66-30-SET', 'lure', 'OWNER Cultiva', 'ST-66 #3/0 + Hyper Wire #9 セット (2組)', 2750, '総重量11.5g。170〜200mm(60〜75g)プラグの浮力バランスを崩さず初期掛かりを重視する標準トレブルセット。'),
    ('HOOK-BKK-SINGLE-70-SET', 'lure', 'BKK / Carpenter', 'Lone Diablo #7/0 (シングル) + 強化リング200lb セット', 3080, '総重量10.5g。トレブル#3/0相当の重量を維持しつつ、クロマグロの口周りに1点貫通させてバラシとフック伸びを防ぐ。'),
    ('HOOK-ST66-40-SET', 'lure', 'OWNER Cultiva', 'ST-66 #4/0 + Hyper Wire #10 セット (2組)', 3080, '総重量16.0g。200〜230mm(85〜100g)プラグに適合する太軸トレブルセット。'),
    ('HOOK-BKK-SINGLE-90-SET', 'lure', 'BKK / Carpenter', 'Lone Diablo #9/0 (シングル) + 強化リング250lb セット', 3520, '総重量15.0g。200〜230mmプラグをシングルフック化し、大型マグロとの高ドラグファイトで針伸びをゼロにする。'),
    ('HOOK-ST66-50-SET', 'lure', 'OWNER Cultiva', 'ST-66 #5/0 + Hyper Wire #11 セット (2組)', 3520, '総重量21.0g。130g超の大型プラグ用モンスターサイズトレブル。'),
    ('HOOK-GAMAKATSU-MURO30-SET', 'lure', 'GAMAKATSU', 'TUNED 管ムロ 30号 + Carpenter 強化リング300lb セット', 3850, '総重量19.5g。100kg超クロマグロの硬い顎を貫通し絶対に折れない・伸びない最終到達点のシングルフックセッティング。')
    RETURNING id, sku
)
INSERT INTO spec_lures (product_id, sub_type, length_mm, weight_g, hook_code, default_sub_hook_sku, min_pe)
SELECT id,
    CASE WHEN sku LIKE 'LURE-%' THEN 'plug_main'::lure_sub_type ELSE 'hook_ring_sub'::lure_sub_type END,
    CASE sku
        WHEN 'LURE-DCLAW-MARINO200-SLIM' THEN 200
        WHEN 'LURE-DCLAW-BEACON180'      THEN 180
        WHEN 'LURE-SHIMANO-BETCHU-190F'  THEN 190
        WHEN 'LURE-SHIMANO-BOMBDIP-170F' THEN 170
        WHEN 'LURE-CBONE-ZORRO220'       THEN 220
        WHEN 'LURE-CBONE-BAZOO200'       THEN 200
        WHEN 'LURE-MARIA-RAPIDO-F230'    THEN 230
        WHEN 'LURE-CBONE-RYAN230'        THEN 230
        ELSE NULL
    END,
    CASE sku
        WHEN 'LURE-DCLAW-MARINO200-SLIM'  THEN 61.0
        WHEN 'LURE-DCLAW-BEACON180'       THEN 70.0
        WHEN 'LURE-SHIMANO-BETCHU-190F'   THEN 73.0
        WHEN 'LURE-SHIMANO-BOMBDIP-170F'  THEN 72.0
        WHEN 'LURE-CBONE-ZORRO220'        THEN 85.0
        WHEN 'LURE-CBONE-BAZOO200'        THEN 96.0
        WHEN 'LURE-MARIA-RAPIDO-F230'     THEN 100.0
        WHEN 'LURE-CBONE-RYAN230'         THEN 130.0
        WHEN 'HOOK-ST66-30-SET'           THEN 11.5
        WHEN 'HOOK-BKK-SINGLE-70-SET'     THEN 10.5
        WHEN 'HOOK-ST66-40-SET'           THEN 16.0
        WHEN 'HOOK-BKK-SINGLE-90-SET'     THEN 15.0
        WHEN 'HOOK-ST66-50-SET'           THEN 21.0
        WHEN 'HOOK-GAMAKATSU-MURO30-SET'  THEN 19.5
    END,
    CASE sku
        WHEN 'LURE-DCLAW-MARINO200-SLIM'  THEN 'CLASS_3_0'
        WHEN 'LURE-DCLAW-BEACON180'       THEN 'CLASS_3_0'
        WHEN 'LURE-SHIMANO-BETCHU-190F'   THEN 'CLASS_3_0'
        WHEN 'LURE-SHIMANO-BOMBDIP-170F'  THEN 'CLASS_3_0'
        WHEN 'LURE-CBONE-ZORRO220'        THEN 'CLASS_4_0'
        WHEN 'LURE-CBONE-BAZOO200'        THEN 'CLASS_4_0'
        WHEN 'LURE-MARIA-RAPIDO-F230'     THEN 'CLASS_4_0'
        WHEN 'LURE-CBONE-RYAN230'         THEN 'CLASS_5_0'
        WHEN 'HOOK-ST66-30-SET'           THEN 'CLASS_3_0'
        WHEN 'HOOK-BKK-SINGLE-70-SET'     THEN 'CLASS_3_0'
        WHEN 'HOOK-ST66-40-SET'           THEN 'CLASS_4_0'
        WHEN 'HOOK-BKK-SINGLE-90-SET'     THEN 'CLASS_4_0'
        WHEN 'HOOK-ST66-50-SET'           THEN 'CLASS_5_0'
        WHEN 'HOOK-GAMAKATSU-MURO30-SET'  THEN 'CLASS_5_0'
    END,
    CASE sku
        WHEN 'LURE-DCLAW-MARINO200-SLIM'  THEN 'HOOK-ST66-30-SET'
        WHEN 'LURE-DCLAW-BEACON180'       THEN 'HOOK-BKK-SINGLE-70-SET'
        WHEN 'LURE-SHIMANO-BETCHU-190F'   THEN 'HOOK-ST66-30-SET'
        WHEN 'LURE-SHIMANO-BOMBDIP-170F'  THEN 'HOOK-BKK-SINGLE-70-SET'
        WHEN 'LURE-CBONE-ZORRO220'        THEN 'HOOK-ST66-40-SET'
        WHEN 'LURE-CBONE-BAZOO200'        THEN 'HOOK-BKK-SINGLE-90-SET'
        WHEN 'LURE-MARIA-RAPIDO-F230'     THEN 'HOOK-ST66-40-SET'
        WHEN 'LURE-CBONE-RYAN230'         THEN 'HOOK-GAMAKATSU-MURO30-SET'
        ELSE NULL
    END,
    CASE sku
        WHEN 'LURE-CBONE-RYAN230'        THEN 8.0
        WHEN 'HOOK-ST66-50-SET'          THEN 8.0
        WHEN 'HOOK-GAMAKATSU-MURO30-SET' THEN 8.0
        ELSE 5.0
    END
FROM ins_lures;
