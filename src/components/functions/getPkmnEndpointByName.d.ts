export const getPkmnEndpointList : (foundNames: string[]) => Promise<[{ name: string; url: string; }]>

export const getPkmnEndpointByName : (name: string) => {name: string, url: string}