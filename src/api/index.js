import axios from "axios";

const API = axios.create({ baseURL: "https://model-deploy-app.herokuapp.com" });

export const getPrediction = (data) => API.post(`/`, data);
