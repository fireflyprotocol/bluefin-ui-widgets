import axios, { AxiosRequestConfig, AxiosResponse, AxiosRequestTransformer } from "axios";

import pkg from "../../package.json";

import { getValue, isEmpty } from "./utils";

let baseURL = "";
const apiService = {
	axiosApi: axios.create({
		baseURL: baseURL,
		headers: {
			"Content-Type": "application/json",
			"x-bluefin-client-version":
				pkg.dependencies["@bluefin-exchange/aggregator-sdk"].split("^")[1] ?? "0",
		},
		validateStatus: (status) => true,
	}),
	post,
	get,
	put,
	patch,
	del,
	handleResponse: handleResponse,
};

let token: string | undefined = "";
let walletAddress: string | undefined = "";

const setTokenResolvers = (AuthKey: string | undefined) => {
	token = AuthKey;
};
const setApiUrl = (url: string) => {
	baseURL = url;
	apiService.axiosApi.defaults.baseURL = url;
};

const setWalletAddress = (address: string | undefined) => {
	walletAddress = address;
};

async function get<T>(
	url: string,
	queryParams?: object,
	config?: AxiosRequestConfig & { isAuthenticationRequired?: boolean }
) {
	const response = await apiService.axiosApi.get(url, {
		params: queryParams,
		...config,
		transformRequest: config?.isAuthenticationRequired ? transformRequest : undefined,
	});
	return apiService.handleResponse<T>(response);
}

async function post<T>(
	url: string,
	data: object,
	config?: AxiosRequestConfig & { isAuthenticationRequired?: boolean }
) {
	const response = await apiService.axiosApi.post(url, data, {
		...config,
		transformRequest: config?.isAuthenticationRequired ? transformRequest : undefined,
	});
	return apiService.handleResponse<T>(response);
}

async function put<T>(
	url: string,
	data: object,
	config?: AxiosRequestConfig & { isAuthenticationRequired?: boolean }
) {
	const response = await apiService.axiosApi.put(url, data, {
		...config,
		transformRequest: config?.isAuthenticationRequired ? transformRequest : undefined,
	});
	return apiService.handleResponse<T>(response);
}

async function patch<T>(
	url: string,
	data: object,
	config?: AxiosRequestConfig & { isAuthenticationRequired?: boolean }
) {
	const response = await apiService.axiosApi.patch(url, data, {
		...config,
		transformRequest: config?.isAuthenticationRequired ? transformRequest : undefined,
	});
	return apiService.handleResponse<T>(response);
}

async function del<T>(
	url: string,
	data: object,
	config?: AxiosRequestConfig & { isAuthenticationRequired?: boolean }
) {
	const response = await apiService.axiosApi.delete(url, {
		...config,
		data: data,
		transformRequest: config?.isAuthenticationRequired ? transformRequest : undefined,
	});
	return apiService.handleResponse<T>(response);
}

function handleResponse<T>(response: AxiosResponse<any>) {
	const mutatedResponse = {
		//TODO:needs to be implemented properly (BE have to change response model first )
		ok:
			response.statusText === "OK" ||
			(response.status >= 200 && response.status < 300),
		status: response.status,
		response: {
			data: getValue(response.data, "error.data", response.data),
			message: getValue(response.data, "error.message", "success"),
			errorCode: getValue(response.data, "error.code", null),
		},
	};

	const data: T = getValue(response, "data", undefined);

	if (mutatedResponse.ok) {
		return { ...mutatedResponse, data };
	} else {
		return {
			...mutatedResponse,
			data: !isEmpty(data) ? data : undefined,
		};
	}
}
const transformRequest: AxiosRequestTransformer = (data, headers) => {
	headers["Authorization"] = `Bearer ${token}`;
	headers["x-wallet-address"] = walletAddress;

	return JSON.stringify(data);
};

export default {
	post: apiService.post,
	get: apiService.get,
	patch: apiService.patch,
	put: apiService.put,
	delete: apiService.del,
	tokenResolverByAccount: setTokenResolvers,
	setWalletAddress,
	setApiUrl: setApiUrl,
};
