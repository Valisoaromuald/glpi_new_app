// common/utils/db.ts
export function rowsAs<T>(rows: unknown): T[] {
  return rows as T[];
}

export function rowAs<T>(row: unknown): T | undefined {
  return row as T | undefined;
}