import { Stack, Skeleton } from '@mui/material';

function TaskListSkeleton() {
  return (
    <Stack spacing={1}>
      {/* Create an array of 4 items to map over */}
      {[...Array(4)].map((_, index) => (
        <Skeleton key={index} variant="rounded" width="100%" height={52} />
      ))}
    </Stack>
  );
}

export default TaskListSkeleton;