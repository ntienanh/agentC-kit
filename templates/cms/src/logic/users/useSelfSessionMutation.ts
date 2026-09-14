import type { ApiResponse } from '@/shared/lib/http/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SessionInfo } from '@/features/users/models';
import { userManagementApi } from '@/features/users/services/user-management.service';
import { USER_MANAGEMENT_QUERY_KEYS } from '@/features/users/utils';

export const useSelfSessionMutation = () => {
  const queryClient = useQueryClient();

  const revokeSession = useMutation({
    mutationFn: ({ jti }: { jti: string }) => userManagementApi.revokeSelfSession(jti),
    onSuccess: (_, { jti }) => {
      queryClient.setQueryData(
        USER_MANAGEMENT_QUERY_KEYS.selfSessions,
        (old: ApiResponse<SessionInfo[]> | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter(s => s.jti !== jti),
          };
        },
      );
    },
  });

  return { revokeSession };
};
