import axios, { isAxiosError } from "axios";

export const api = axios.create({
  baseURL: "https://bibliotecaactiva-api.aaron-navarro.workers.dev/api",
});

