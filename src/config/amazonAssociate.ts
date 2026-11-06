/**
 * Amazonアソシエイト（Amazon.co.jp）設定・リンク生成ユーティリティ
 *
 * 1. 環境変数 `VITE_AMAZON_ASSOCIATE_TAG` が設定されている場合はそれを使用します。
 * 2. ブラウザの localStorage (`rigs_amazon_associate_tag`) に保存されたIDがあれば優先適用します。
 * 3. いずれも未設定の場合は `DEFAULT_AMAZON_ASSOCIATE_TAG` を使用します。
 */

export const DEFAULT_AMAZON_ASSOCIATE_TAG =
  import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'rigs-offshore-22';

const STORAGE_KEY = 'rigs_amazon_associate_tag';

/**
 * 現在有効なAmazonアソシエイト・トラッキングID（例: `xxxx-22`）を取得します。
 */
export function getAssociateTag(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  }
  return DEFAULT_AMAZON_ASSOCIATE_TAG;
}

/**
 * ブラウザ上にAmazonアソシエイト・トラッキングIDを保存します。
 */
export function setAssociateTag(tag: string): void {
  if (typeof window !== 'undefined') {
    const cleaned = tag.trim();
    if (cleaned) {
      window.localStorage.setItem(STORAGE_KEY, cleaned);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export interface AmazonLinkTarget {
  /** Amazon標準商品番号（10桁のASINが確定している場合に指定） */
  asin?: string;
  /** Amazon検索キーワード（釣具の番手・号数など確実にヒットさせる検索クエリ） */
  searchQuery: string;
  /** サブアイテム（ショックリーダーや太軸フックなど）の検索クエリ */
  subItemQuery?: string;
  /** サブアイテムの表示名 */
  subItemLabel?: string;
}

/**
 * アソシエイトタグ付きのAmazon商品URL（または検索結果URL）を生成します。
 * ※Amazonアソシエイトでは、検索結果ページ（`/s?k=...&tag=...`）経由でユーザーが商品をカートに入れても
 * 24時間以内のカート追加分すべてに適格販売報酬が適用されます。
 */
export function buildAmazonAffiliateUrl(
  params: { asin?: string; searchQuery: string },
  customTag?: string
): string {
  const tag = (customTag ?? getAssociateTag()).trim();
  if (params.asin && /^[A-Z0-9]{10}$/i.test(params.asin.trim())) {
    const url = new URL(`https://www.amazon.co.jp/dp/${params.asin.trim()}`);
    if (tag) {
      url.searchParams.set('tag', tag);
      url.searchParams.set('linkCode', 'll1');
    }
    return url.toString();
  }

  const url = new URL('https://www.amazon.co.jp/s');
  url.searchParams.set('k', params.searchQuery);
  if (tag) {
    url.searchParams.set('tag', tag);
    url.searchParams.set('linkCode', 'll2');
  }
  return url.toString();
}
