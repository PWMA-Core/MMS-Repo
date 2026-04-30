import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 0 → every navigation that mounts a query refetches. The
      // mock client reads localStorage synchronously so this is cheap; on
      // hosted Supabase the round-trips are also fast. Demo pages need
      // fresh DB-backed numbers (queues, counts) the moment the user
      // lands on them, without a hard refresh.
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
