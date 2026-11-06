/**
 * Amazonアソシエイト（Amazon.co.jp）個別商品ページ直リンク生成ユーティリティ
 * トラッキングIDはサイト運営者の固定ID（`rigsoffshore-22`）を使用します。
 */

export const AMAZON_ASSOCIATE_TAG =
  import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'rigsoffshore-22';

export interface AmazonLinkTarget {
  /** Amazon標準商品番号（10桁のASIN） */
  asin: string;
  /** Amazon検索キーワード（フォールバック用） */
  searchQuery: string;
  /** サブアイテム（ショックリーダーや太軸フックなど）のASIN */
  subItemAsin?: string;
  /** サブアイテムの検索クエリ */
  subItemQuery?: string;
  /** サブアイテムの表示名 */
  subItemLabel?: string;
}

/**
 * アソシエイトタグ（`rigsoffshore-22`）付きのAmazon個別商品ページURL（`/dp/{ASIN}`）を生成します。
 */
export function buildAmazonAffiliateUrl(params: {
  asin?: string;
  searchQuery: string;
}): string {
  if (params.asin && /^[A-Z0-9]{10}$/i.test(params.asin.trim())) {
    const url = new URL(`https://www.amazon.co.jp/dp/${params.asin.trim()}`);
    url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
    url.searchParams.set('linkCode', 'll1');
    return url.toString();
  }

  const url = new URL('https://www.amazon.co.jp/s');
  url.searchParams.set('k', params.searchQuery);
  url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG);
  url.searchParams.set('linkCode', 'll2');
  return url.toString();
}
