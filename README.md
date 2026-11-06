# RIGs — オフショアビッグゲーム特化型タックル互換性判定＆ビルドEC

**Concept**: *"数万円の高額決済を後押しする、絶対的な安心感とサイバーな機能美"*

クロマグロ・ヒラマサのオフショアキャスティングに特化し、リールのスプール糸巻き量、ロッドの適合PE・最大ドラグ負荷、太軸フック＆リング装着時のルアー実戦総重量まで**物理的整合性を100%計算する「Tackle Builder」**を搭載したECプラットフォームです。

---

## 1. デザインシステム & UI/UX 設計要件 (Awwwards Quality)

1. **Vibe & Style (Cyberpunk × Glassmorphism × Bento Grid)**
   - **Cyberpunk & Glassmorphism**: すりガラスのような透明感とぼかし（`backdrop-blur-xl`）に繊細なハイライトボーダーとエレクトリックブルーのグロウを重ねた、サイバーな機能美。
   - **Bento Grid レイアウト**: 総合互換性テレメトリー、海域別プリセット、4スロット構成ドック、適合ロッドシナジーパネル、パーツセレクターを弁当箱（Bento Grid）のように美しく区画整理。
2. **Color Palette (60:30:10 の法則)**
   - **Base (60%)**: `#1A1A1A` (Matte Black — 目に優しいダークグレー背景)
   - **Sub (30%)**: `#2D2D2D` (Charcoal Gray — グラスモーフィズムBentoサーフェス)
   - **Accent (10%)**: `#00E5FF` (Electric Blue — 100%物理適合インジケーター、Glow、CTA)
3. **Typography**
   - 見出し・UIラベル: **Inter**
   - ドラグ力・価格・自重・適合スコア等のスペック数値: **Oswald**
   - 日本語テキスト: **Noto Sans JP**（ウェイトの繊細な使い分けによる高級感と可読性の両立）
4. **Interactions**
   - **0.3秒の物理浮き上がりホバー (`.cyber-float-hover`)**: ボタンや選択済みアイテム・カードのHover時に `0.3s` かけてふんわりと浮き上がり（`scale(1.05)`、Shadow増強、`#00E5FF` のGlow効果）、手触りのある操作感を提供。
   - **Stagger + Spring（バネ）アニメーション (`.animate-spring-stagger`)**: 適合するロッドが選ばれた際やリールに応じた適合ロッド展開時に、対象の要素が下から遅延（Stagger）しながらバネ（Spring）のような弾性挙動で出現。
5. **Responsive & Accessibility (WCAG AA)**
   - モバイル（`375px`〜）では縦スクロール＋フローティングテレメトリーバー、タブレット以上（`768px`〜）では12カラム横並びの **Bento Grid** レイアウトへ自動展開。
   - **WCAG AA準拠**: コントラスト比 4.5:1 以上を確保し、キーボード操作と明確な `:focus-visible` リングを全インタラクティブ要素に実装。

---

## 2. コア機能・特徴

1. **4スロット＋サブスロット自動バンドル構成 (`MY TACKLE BENTO`)**
   - `01 REEL` / `02 ROD` / `03 LINE` / `04 LURE` の4スロットを維持しつつ、`PEライン` を選ぶと適合する `ショックリーダー` が、`プラグ` を選ぶと浮力バランスを崩さない `太軸フック＆強化スプリットリング` がサブスロットへ自動セット（トレブル／シングルのワンクリック切替可）されます。
2. **物理根拠に基づく「不適合理由（NG理由）」の明示**
   - 例：`CB ONE BAZOO 200` は本体重量 `96g` のため、`Aquila MLT 82-3/6 (上限110g)` の範囲内に見えますが、適合フック（`+15.0g〜16.0g`）を装着すると**実戦総重量 `111.0g〜112.0g` となり上限を1〜2g超過する**ため、自動的に「フック込重量超過」として警告します。
   - 例：`19 STELLA SW 14000XG (PE8号容量200m)` に対して `PE8号 300m` を選択しようとすると、「スプール容量超過（100m余り巻ききれません）」と物理的根拠を表示します。
3. **ハイブリッド・データエンジン (Supabase PostgreSQL + Local Master Fallback)**
   - `.env` に Supabase の接続情報を設定すれば PostgreSQL データベース（40アイテムSeed済）と通信し、未設定時でもローカルの40アイテム・マスターカタログで即座に100%フル動作します。
4. **AI自律運営コンソール（JSON一括投入）**
   - メーカーのスペック表からLLMが抽出した単一JSONを画面上のコンソール（またはSupabaseの `upsert_gear_from_ai_json` RPC関数）に投入するだけで、カタログと互換性エンジンへ即座に反映されます。

---

## 3. ディレクトリ構成

- `supabase/migrations/20261105000000_init_schema_and_seed.sql`: Supabase用テーブル定義（`products`, `spec_reels`, `spec_rods`, `spec_lines`, `spec_lures`）、互換性判定RPC関数、AI JSON投入RPC関数、および厳選40アイテムのSeed SQL完全版。
- `src/engine/compatibilityEngine.ts`: フロントエンドでミリ秒単位のリアルタイム判定を行う物理互換性判定エンジン。
- `src/data/masterCatalog.ts`: オフショア・キャスティング厳選40アイテム＆海域別3大プリセットのマスターデータ。
- `src/components/`:
  - `TackleBoxDock.tsx`: 左ペインの4スロット＋サブスロットBentoドック＆6項目物理整合性チェックリスト。
  - `ItemSelectorGrid.tsx`: 右ペインのBentoセレクター・選択中ロッドのStagger Springシナジーパネル・不適合理由明示カード。
  - `GearSchematic.tsx`: 番手・寸法・号数・重量レンジを視覚伝達するサイバーCAD図面スタイルSVG＆スイートスポットゲージ。
  - `SpecSheetModal.tsx`: 実戦セッティング仕様書出力・SNS共有テキスト生成・AI JSON投入テストコンソール。

---

## 4. セットアップ＆起動方法

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド検証
npm run build
```
