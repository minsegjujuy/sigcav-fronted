import queryString from "query-string";

function buildUrl(baseUrl: string, params: Record<string, any>): string {
    const query = queryString.stringify(params, { skipNull: true, skipEmptyString: true });
    return `${baseUrl}?${query}`;
}

  export default buildUrl;