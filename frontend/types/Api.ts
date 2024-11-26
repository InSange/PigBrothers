/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** Item */
export interface Item {
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Description */
  description?: string;
}

/** ItemResponse */
export interface ItemResponse {
  /** Id */
  id: number;
  /** Name */
  name: string;
  /** Price */
  price: number;
  /** Description */
  description?: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type AddItemToFirestoreFirebaseItemsPostData = any;

export type AddItemToFirestoreFirebaseItemsPostError = HTTPValidationError;

export type GetItemFromFirestoreFirebaseItemsItemIdGetData = any;

export type GetItemFromFirestoreFirebaseItemsItemIdGetError = HTTPValidationError;

export type AddItemToRealtimeFirebaseRealtimeItemsPostData = any;

export type AddItemToRealtimeFirebaseRealtimeItemsPostError = HTTPValidationError;

export type GetItemFromRealtimeFirebaseRealtimeItemsItemIdGetData = any;

export type GetItemFromRealtimeFirebaseRealtimeItemsItemIdGetError = HTTPValidationError;

export type RootTestGetData = any;

/** Response Read Items Items  Get */
export type ReadItemsItemsGetData = ItemResponse[];

export type CreateItemItemsPostData = ItemResponse;

export type CreateItemItemsPostError = HTTPValidationError;

export type ReadItemItemsItemIdGetData = ItemResponse;

export type ReadItemItemsItemIdGetError = HTTPValidationError;

export type UpdateItemItemsItemIdPutData = ItemResponse;

export type UpdateItemItemsItemIdPutError = HTTPValidationError;

/** Response Delete Item Items  Item Id  Delete */
export type DeleteItemItemsItemIdDeleteData = object;

export type DeleteItemItemsItemIdDeleteError = HTTPValidationError;

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title My API with Response Models
 * @version 1.0.0
 *
 * This API demonstrates how to define response types using response_model.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  firebase = {
    /**
     * @description Add an item to Firestore.
     *
     * @tags Firebase
     * @name AddItemToFirestoreFirebaseItemsPost
     * @summary Add Item To Firestore
     * @request POST:/firebase/items/
     * @response `200` `AddItemToFirestoreFirebaseItemsPostData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    addItemToFirestoreFirebaseItemsPost: (data: Item, params: RequestParams = {}) =>
      this.request<AddItemToFirestoreFirebaseItemsPostData, AddItemToFirestoreFirebaseItemsPostError>({
        path: `/firebase/items/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve an item from Firestore by ID.
     *
     * @tags Firebase
     * @name GetItemFromFirestoreFirebaseItemsItemIdGet
     * @summary Get Item From Firestore
     * @request GET:/firebase/items/{item_id}
     * @response `200` `GetItemFromFirestoreFirebaseItemsItemIdGetData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    getItemFromFirestoreFirebaseItemsItemIdGet: (itemId: string, params: RequestParams = {}) =>
      this.request<GetItemFromFirestoreFirebaseItemsItemIdGetData, GetItemFromFirestoreFirebaseItemsItemIdGetError>({
        path: `/firebase/items/${itemId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Add an item to Realtime Database.
     *
     * @tags Firebase
     * @name AddItemToRealtimeFirebaseRealtimeItemsPost
     * @summary Add Item To Realtime
     * @request POST:/firebase/realtime/items/
     * @response `200` `AddItemToRealtimeFirebaseRealtimeItemsPostData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    addItemToRealtimeFirebaseRealtimeItemsPost: (data: Item, params: RequestParams = {}) =>
      this.request<AddItemToRealtimeFirebaseRealtimeItemsPostData, AddItemToRealtimeFirebaseRealtimeItemsPostError>({
        path: `/firebase/realtime/items/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve an item from Realtime Database by ID.
     *
     * @tags Firebase
     * @name GetItemFromRealtimeFirebaseRealtimeItemsItemIdGet
     * @summary Get Item From Realtime
     * @request GET:/firebase/realtime/items/{item_id}
     * @response `200` `GetItemFromRealtimeFirebaseRealtimeItemsItemIdGetData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    getItemFromRealtimeFirebaseRealtimeItemsItemIdGet: (itemId: string, params: RequestParams = {}) =>
      this.request<
        GetItemFromRealtimeFirebaseRealtimeItemsItemIdGetData,
        GetItemFromRealtimeFirebaseRealtimeItemsItemIdGetError
      >({
        path: `/firebase/realtime/items/${itemId}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  test = {
    /**
     * No description
     *
     * @tags FirebaseTest
     * @name RootTestGet
     * @summary Root
     * @request GET:/test/
     * @response `200` `RootTestGetData` Successful Response
     */
    rootTestGet: (params: RequestParams = {}) =>
      this.request<RootTestGetData, any>({
        path: `/test/`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  items = {
    /**
     * @description Retrieve a list of all items.
     *
     * @tags Items
     * @name ReadItemsItemsGet
     * @summary Get All Items
     * @request GET:/items/
     * @response `200` `ReadItemsItemsGetData` Successful Response
     */
    readItemsItemsGet: (params: RequestParams = {}) =>
      this.request<ReadItemsItemsGetData, any>({
        path: `/items/`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new item and return the created item with an ID.
     *
     * @tags Items
     * @name CreateItemItemsPost
     * @summary Create an Item
     * @request POST:/items/
     * @response `200` `CreateItemItemsPostData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    createItemItemsPost: (data: Item, params: RequestParams = {}) =>
      this.request<CreateItemItemsPostData, CreateItemItemsPostError>({
        path: `/items/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve an item by its ID.
     *
     * @tags Items
     * @name ReadItemItemsItemIdGet
     * @summary Get an Item
     * @request GET:/items/{item_id}
     * @response `200` `ReadItemItemsItemIdGetData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    readItemItemsItemIdGet: (itemId: number, params: RequestParams = {}) =>
      this.request<ReadItemItemsItemIdGetData, ReadItemItemsItemIdGetError>({
        path: `/items/${itemId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update an existing item and return the updated item.
     *
     * @tags Items
     * @name UpdateItemItemsItemIdPut
     * @summary Update an Item
     * @request PUT:/items/{item_id}
     * @response `200` `UpdateItemItemsItemIdPutData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    updateItemItemsItemIdPut: (itemId: number, data: Item, params: RequestParams = {}) =>
      this.request<UpdateItemItemsItemIdPutData, UpdateItemItemsItemIdPutError>({
        path: `/items/${itemId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an item by its ID and return a confirmation message.
     *
     * @tags Items
     * @name DeleteItemItemsItemIdDelete
     * @summary Delete an Item
     * @request DELETE:/items/{item_id}
     * @response `200` `DeleteItemItemsItemIdDeleteData` Successful Response
     * @response `422` `HTTPValidationError` Validation Error
     */
    deleteItemItemsItemIdDelete: (itemId: number, params: RequestParams = {}) =>
      this.request<DeleteItemItemsItemIdDeleteData, DeleteItemItemsItemIdDeleteError>({
        path: `/items/${itemId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),
  };
}
