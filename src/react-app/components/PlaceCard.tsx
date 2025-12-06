import { Button } from "@/components/ui/button";
import { SearchPlaceResult } from "@/worker/usecase/places/SearchPlacesNearbyUseCase";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, X, Heart } from "lucide-react";

export const PlaceCard = ({ place }: { place: SearchPlaceResult }) => {
  const formatPriceLevel = (priceLevel: number | null): string | null => {
    if (priceLevel === null) return null;
    // Google Places API: 0=無料, 1=安い, 2=普通, 3=高い, 4=非常に高い
    const priceRanges = [
      null,
      "¥500 ~ 1,000",
      "¥1,000 ~ 2,000",
      "¥2,000 ~ 4,000",
      "¥4,000 ~",
    ];
    return priceRanges[priceLevel] ?? null;
  };

  const getCategoryLabel = (categoryTag: string | null): string => {
    if (!categoryTag) return "スポット";
    // カテゴリタグから適切なラベルを生成
    return categoryTag.toUpperCase();
  };

  const getLocationName = (address: string | null): string => {
    if (!address) return "";
    // 住所から最初の部分（市区町村など）を取得
    const parts = address.split(/[都道府県市区町村]/);
    if (parts.length > 1) {
      return parts[0] + (address.match(/[都道府県市区町村]/)?.[0] ?? "");
    }
    return address.split(",")[0] ?? address;
  };

  return (
    <div className='rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 bg-gray-900/30 flex flex-col h-[600px]'>
      {/* 上部セクション（約2/3） - 薄いベージュ背景 */}
      <div className='bg-stone-50 relative flex-[2] overflow-hidden'>
        {place.cachedImageUrl ? (
          <img
            src={place.cachedImageUrl}
            alt={place.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <span className='text-gray-400 text-sm'>画像なし</span>
          </div>
        )}
        {/* オーバーレイ情報 */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
          <div className='space-y-2'>
            {/* カテゴリバッジ */}
            {place.categoryTag && (
              <Badge
                variant='secondary'
                className='bg-white/20 text-white border-white/30 backdrop-blur-sm'
              >
                {getCategoryLabel(place.categoryTag)}
              </Badge>
            )}
            {/* 店舗名 */}
            <h3 className='text-white text-2xl font-bold'>{place.name}</h3>
            {/* 場所と評価 */}
            <div className='flex items-center gap-2 text-white text-sm'>
              {place.address && (
                <>
                  <MapPin className='size-4' />
                  <span>{getLocationName(place.address)}</span>
                </>
              )}
              {place.rating && (
                <>
                  <span className='mx-1'>•</span>
                  <Star className='size-4 fill-yellow-400 text-yellow-400' />
                  <span>{place.rating.toFixed(1)}</span>
                </>
              )}
            </div>
            {/* 価格帯とハッシュタグ */}
            <div className='flex items-center gap-2 flex-wrap'>
              {formatPriceLevel(place.priceLevel) && (
                <Badge
                  variant='secondary'
                  className='bg-white/20 text-white border-white/30 backdrop-blur-sm'
                >
                  {formatPriceLevel(place.priceLevel)}
                </Badge>
              )}
              {place.categoryTag && (
                <Badge
                  variant='secondary'
                  className='bg-white/20 text-white border-white/30 backdrop-blur-sm'
                >
                  #{place.categoryTag}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 下部セクション（約1/3） - 赤茶色背景 */}
      <div className='bg-amber-900/80 p-4 space-y-3 flex-[1] flex flex-col justify-between'>
        {/* 店舗情報 */}
        <div className='space-y-1'>
          <h4 className='text-white font-bold text-base'>{place.name}</h4>
          {place.address && (
            <p className='text-white/90 text-sm line-clamp-2'>
              {place.address}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className='flex justify-center gap-4 pt-2'>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full size-12 bg-white/10 border-white/20 hover:bg-white/20 text-white'
          >
            <X className='size-5' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full size-12 bg-white/10 border-white/20 hover:bg-white/20 text-white'
          >
            <Heart className='size-5' />
          </Button>
        </div>
      </div>
    </div>
  );
};
