import type { ApiResponse } from '@/shared/lib/http/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PublicProfile } from '@/features/users/models';
import { userManagementApi } from '@/features/users/services/user-management.service';
import type { UpdateSelfProfileRequest } from '@/features/users/services/user-management.types';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export const useSelfProfileMutation = () => {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateSelfProfileRequest) => {
      const res = await userManagementApi.updateSelfProfile(data);
      if (res.error) {
        throw new Error(res.error.message || 'PROFILE_UPDATE_FAILED');
      }
      return res.data!;
    },
    onSuccess: (updated: PublicProfile) => {
      queryClient.setQueryData(
        USER_MANAGEMENT_QUERY_KEYS.selfProfile,
        (old: ApiResponse<PublicProfile> | undefined) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, ...updated } };
        },
      );
    },
  });

  return { updateProfile };
};
