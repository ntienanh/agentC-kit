import { resolveCmsAssetUrl } from '@/shared/lib/http';

type MediaLikeFormat = {
  url: string;
};

type MediaLike = {
  url?: string | null;
  formats?: {
    thumbnail?: MediaLikeFormat;
    small?: MediaLikeFormat;
  } | null;
};

export function getMediaUrl(media: MediaLike | null | undefined): string {
  if (!media?.url) return '';
  return resolveCmsAssetUrl(media.url);
}

export function getMediaThumbnailUrl(media: MediaLike | null | undefined): string {
  if (!media) return '';
  if (media.formats?.thumbnail?.url) return getMediaUrl({ ...media, url: media.formats.thumbnail.url });
  if (media.formats?.small?.url) return getMediaUrl({ ...media, url: media.formats.small.url });
  return getMediaUrl(media);
}
