// Tiny gql tag — returns the template string as-is (graphql-request accepts strings)
export const gql = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce<string>((acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ''), '');
