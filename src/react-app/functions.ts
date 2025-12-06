import { client } from "@/react-app/lib/hono";
import { SearchPlacesNearbyInput } from "@/worker/usecase/places/SearchPlacesNearbyUseCase";
import { toast } from "sonner";

export async function searchPlacesNearby(
  data: Omit<SearchPlacesNearbyInput, "userId">
) {
  const response = await client.places.search.nearby.$post({
    json: {
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      radius: 1000,
      type: data.type,
      keyword: data.keyword,
      limit: 5,
    },
  });

  return response.json();
}

export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("Geolocation APIはこのブラウザでサポートされていません")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationInfo = {
          latitude,
          longitude,
          accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };

        console.log("現在地:", locationInfo);
        console.log(`緯度: ${latitude}, 経度: ${longitude}`);

        resolve(position.coords);
      },
      (error) => {
        console.error("位置情報の取得に失敗しました:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "位置情報の使用が拒否されました。ブラウザの設定から位置情報の許可を有効にしてください。"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error(
              "位置情報が利用できません。GPSやネットワーク接続を確認してください。"
            );
            break;
          case error.TIMEOUT:
            toast.error(
              "位置情報の取得がタイムアウトしました。もう一度お試しください。"
            );
            break;
        }

        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};
