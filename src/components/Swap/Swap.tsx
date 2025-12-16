import { useEffect, useState } from "react";

import {
	AggregatorSDK,
	Environments,
	OnChain,
	SuiBlocks,
} from "@bluefin-exchange/aggregator-sdk";
import {
	BluefinAggregatorResponse,
	GetAssetsResponse,
	SplitPaths,
} from "@bluefin-exchange/aggregator-sdk/build/src/interfaces";
import { TransactionBlock } from "@bluefin-exchange/bluefin-v2-client";
import {
	Button,
	Col,
	Form,
	FormItem,
	Input,
	Row,
	Space,
} from "@bluefin-exchange/starship-v2";
import { CoinAsset } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { Signer } from "@mysten/sui.js/dist/cjs/cryptography";
import { WalletContextState } from "@suiet/wallet-kit";
import { ReactComponent as ArrowHorizontalIcon } from "assets/icons/arrows-horizontal.svg";
import { ReactComponent as ArrowVerticalIcon } from "assets/icons/arrows-vertical.svg";
import { ReactComponent as CaretDown } from "assets/icons/caret-down.svg";
import { ReactComponent as ChevronRightIcon } from "assets/icons/chevron-right.svg";
import { ReactComponent as GenericTokenIcon } from "assets/icons/ethGeneric.svg";
import { ReactComponent as HistoryIcon } from "assets/icons/history.svg";
import { ReactComponent as ReplaceIcon } from "assets/icons/replace.svg";
import { ReactComponent as Routing } from "assets/icons/routing.svg";
import { ReactComponent as SettingIcon } from "assets/icons/setting.svg";
import { ReactComponent as WalletIcon } from "assets/icons/wallet.svg";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useTranslation } from "react-i18next";


import { RenderIfElse } from "components/HOCs";
import Skeleton from "components/Skeleton";
import { DEFAULT_PRECISION } from "constants/Common";
import { NotificationService } from "utils/notification.service";
import {
	handleNumberSanitizationWithPrecision,
	percentageDifference,
	sanitizeAccountAddress,
} from "utils/utils";

import styles from "./index.module.scss";
import MaxSlippageModal from "./Modals/MaxSlippageModal/MaxSlippageModal";
import SettingModal from "./Modals/SettingModal/SettingModal";
import SwapRouteModal from "./Modals/SwapRouteModal/SwapRouteModal";
import TokenSelectModal from "./Modals/TokenSelectModal/TokenSelectModal";
import "./swapColour.scss";

export type TokenDetails = GetAssetsResponse & {
	name?: string;
	balance?: string;
	iconURl?: string;
};

export type RouteVisualizationDetail = {
	[key in string]: {
		quantityIn: number;
		quantityOut: number;
		path: string[];
		pathDetail: {
			[key in string]: {
				name: string;
				quantityIn: number;
				quantityOut: number;
				exchangesDetails: { quantity: number; name: string }[];
			};
		};
	};
};

const DEFAULT_SOURCE_TOKEN =
	"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const DEFAULT_TARGET_TOKEN =
	"0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

export type PriceData = { [key in string]: { price: number; symbol: string } };
const Swap = ({
	suiSignerObject,
	onConnectWallet,
	onClickHistoryButton
}: {
	suiSignerObject: Signer & WalletContextState;
	onConnectWallet: () => void;
	onClickHistoryButton:() => void;
}) => {
	const [client, setClient] = useState<AggregatorSDK>(
		new AggregatorSDK(Environments["prod"], suiSignerObject)
	);
	const [showSwapRoute, setShowSwapRoute] = useState(false);
	const [isLoadingTokenList, setIsLoadingTokenList] = useState(false);
	const [isLoadingFromPrice, setIsLoadingFromPrice] = useState(false);
	const [isLoadingToPrice, setIsLoadingToPrice] = useState(false);
	const [isSwapping, setIsSwapping] = useState(false);
	const [isLoadingSwappableTokenList, setIsLoadingSwappableTokenList] = useState(false);
	const [showFromTokenSelectModal, setShowFromTokenSelectModal] = useState(false);
	const [fromQuantity, setFromQuantity] = useState<number | undefined>(undefined);
	const [fromPrice, setFromPrice] = useState<number>(0);
	const [toPrice, setToPrice] = useState<number>(0);
	const [toQuantity, setToQuantity] = useState<number | undefined>(undefined);
	const [showToTokenSelectModal, setShowToTokenSelectModal] = useState(false);
	const [swappableAssetsList, setSwappableAssetList] = useState<GetAssetsResponse[]>(
		[]
	);
	const [tokenList, setTokenList] = useState<GetAssetsResponse[]>([]);
	const [swapDetails, setSwapDetails] = useState<BluefinAggregatorResponse>();
	const [isLoadingSwapDetails, setIsLoadingSwapDetails] = useState(false);

	const { t } = useTranslation("translations");

	const [swapQuantityInfo, setSwapQuantityInfo] = useState<{
		quantity: number | undefined;
		byAmountIn: boolean;
	}>({ quantity: undefined, byAmountIn: true });
	const [slippagePercentage, setSlippagePercentage] = useState(0.1);
	const [showSlippageModal, setShowSlippageModal] = useState(false);
	const [showSettingModal, setShowSettingModal] = useState(false);
	const [switchLoading, setSwitchLoading] = useState(false);
	const [toToken, setToToken] = useState<TokenDetails | undefined>(undefined);
	const [fromToken, setFromToken] = useState<TokenDetails | undefined>(undefined);
	const [isBalanceLoading, setIsBalanceLoading] = useState(false);
	const [userTokenDetails, setUserTokenDetails] = useState<CoinAsset[]>([]);
	const [priceObject, setPriceObject] = useState<PriceData>({});
	const [routeVisualizationDetail, setRoutVisualizationDetail] = useState<
		| {
				numberOfHops: number;
				numberOfExchanges: number;
				pathList: string[];
				pathDetails: RouteVisualizationDetail;
		  }
		| undefined
	>(undefined);
	const [fromWalletBalance, setFromWalletBalance] = useState(0);

	useEffect(() => {
		if (suiSignerObject.toSuiAddress()) {
			setClient(new AggregatorSDK(Environments["prod"], suiSignerObject));
		}
	}, [suiSignerObject]);
	useEffect(() => {
		if (client && fromToken?.id) {
			fetchSwappableAssets(client, fromToken.id);
			if (fromToken.coin) {
				fetchAndUpdateFromPrice(fromToken.coin);
			} else {
				setFromPrice(0);
			}
		}
	}, [fromToken]);
	useEffect(() => {
		if (client && toToken?.coin) {
			fetchAndUpdateToPrice(toToken.coin);
		} else {
			setToPrice(0);
		}
	}, [toToken]);
	useEffect(() => {
		if (client) {
			fetchTokensList(client);
			fetchUserTokenDetails();
		}
	}, [client]);
	useEffect(() => {
		let refreshInterval: NodeJS.Timeout | undefined;
		if (toToken && fromToken && client) {
			refreshInterval = setTimeout(async () => {
				if (swapQuantityInfo.quantity) {
					await fetchSwapDetails(
						client,
						fromToken,
						toToken,
						swapQuantityInfo.quantity,
						swapQuantityInfo.byAmountIn
					);
				} else {
					swapQuantityInfo.byAmountIn
						? setToQuantity(undefined)
						: setFromQuantity(undefined);
				}
			}, 500);
		}

		return () => {
			if (refreshInterval) {
				clearTimeout(refreshInterval);
			}
		};
	}, [toToken, fromToken, client, swapQuantityInfo]);

	useEffect(() => {
		if (fromToken && client) {
			fetchBalance(fromToken.address, fromToken.decimals);
		}
	}, [fromToken, client]);

	useEffect(() => {
		if (tokenList.length > 0 && userTokenDetails.length > 0) {
			fetchAndUpdatePrice();
		}

		setFromToken(
			tokenList.find((item) => item.address === DEFAULT_SOURCE_TOKEN) ??
				tokenList.find((_) => true)
		);
	}, [tokenList, userTokenDetails]);

	const transformSplits = (
		splits: SplitPaths[],
		fromToken: TokenDetails,
		toToken: TokenDetails
	) => {
		let hops = 0;
		let exchanges: { [key in string]: boolean } = {};

		const pathArray: string[] = [];
		const pathDetails: RouteVisualizationDetail = {};

		splits.map((item) => {
			const path = item.edges.reduce((list: string[], item) => {
				if (list.length && list.findLast((item) => true) == item.fromNode) {
					return [...list, item.toNode];
				}
				return [...list, item.fromNode, item.toNode];
			}, []);

			const pathString = path.join(",");
			if (!pathDetails[pathString]) {
				hops += item.edges.length;
				pathArray.push(path.join(","));
			}
			const perviousValue = pathDetails[pathString] ?? {};
			pathDetails[pathString] = perviousValue ?? {};
			pathDetails[pathString].quantityIn =
				perviousValue.quantityIn ??
				0 +
					new BigNumber(item.inputAmount)
						.div(
							new BigNumber(10).pow(
								item.nodes?.[fromToken.id ?? ""].decimals ?? 0
							)
						)
						.toNumber();
			pathDetails[pathString].quantityOut =
				perviousValue.quantityOut ??
				0 +
					new BigNumber(item.outputAmount)
						.div(
							new BigNumber(10).pow(item.nodes?.[toToken.id].decimals ?? 0)
						)
						.toNumber();

			pathDetails[pathString].path = path;

			item.edges.map((edge) => {
				exchanges[edge.exchange] = true;
				const sourceDecimal = item.nodes[edge.fromNode].decimals;
				const destinationDecimal = item.nodes[edge.toNode].decimals;
				if (!pathDetails[pathString].pathDetail) {
					pathDetails[pathString].pathDetail = {};
				}
				pathDetails[pathString].pathDetail[edge.toNode] = {
					name: (item.nodes as any)[edge.toNode]?.name ?? "",
					quantityIn:
						(perviousValue.pathDetail[edge.toNode]?.quantityIn ?? 0) +
						new BigNumber(item.inputAmount)
							.div(new BigNumber(10).pow(sourceDecimal))
							.toNumber(),
					quantityOut:
						(perviousValue.pathDetail[edge.toNode]?.quantityOut ?? 0) +
						new BigNumber(item.outputAmount)
							.div(new BigNumber(10).pow(destinationDecimal))
							.toNumber(),

					exchangesDetails: [
						...(perviousValue.pathDetail[edge.toNode]?.exchangesDetails ??
							[]),
						{
							name: edge.exchange,
							quantity: new BigNumber(item.outputAmount)
								.div(new BigNumber(10).pow(destinationDecimal))
								.toNumber(),
						},
					],
				};
			});
		});
		setRoutVisualizationDetail({
			numberOfHops: hops,
			numberOfExchanges: Object.keys(exchanges).length,
			pathList: pathArray,
			pathDetails: pathDetails,
		});
	};

	const fetchAndUpdatePrice = () => {
		if (tokenList && userTokenDetails) {
			userTokenDetails.forEach(async (userToken) => {
				const token = tokenList.find((item) => {
					const addressSplit = userToken.coinAddress.split(":");
					addressSplit[0] = sanitizeAccountAddress(addressSplit[0], "SUI");

					return addressSplit.join(":") == item.address;
				});
				if (token) {
					const price = await fetchPriceBySymbol(token.coin);

					if (price && price > 0) {
						setPriceObject((previousPriceObject) => ({
							...previousPriceObject,
							[token.address]: {
								price,
								symbol: token.coin,
							},
						}));
					}
				}
			});
		}
	};

	const fetchAndUpdateFromPrice = async (symbol: string) => {
		setIsLoadingFromPrice(true);
		try {
			const price = await fetchPriceBySymbol(symbol);
			if (price && price > 0) {
				setFromPrice(price);
			} else {
				setFromPrice(0);
			}
		} catch (e) {
			setFromPrice(0);
		}
		setIsLoadingFromPrice(false);
	};
	const fetchAndUpdateToPrice = async (symbol: string) => {
		setIsLoadingToPrice(true);
		try {
			const price = await fetchPriceBySymbol(symbol);
			if (price && price > 0) {
				setToPrice(price);
			} else {
				setToPrice(0);
			}
		} catch (e) {
			setToPrice(0);
		}
		setIsLoadingToPrice(false);
	};

	const fetchPriceBySymbol = async (symbol: string) => {
		return +(await client.getAssetPrice(symbol));
	};

	const fetchBalance = async (coinType: string, decimals: number = 2) => {
		setIsBalanceLoading(true);
		const balance = await client?.onChain.getUserCoinBalance(coinType, decimals);

		setFromWalletBalance(balance);
		setIsBalanceLoading(false);
	};
	const fetchUserTokenDetails = async () => {
		const coins = await OnChain.getCoinAssets(
			suiSignerObject.toSuiAddress() ?? "",
			client.suiClient
		);

		const mergeCoinBalance = coins.reduce(
			(merge: { [key in string]: CoinAsset }, item) => {
				if (merge[item.coinAddress]) {
					return {
						...merge,
						[item.coinAddress]: {
							...merge[item.coinAddress],
							balance:
								BigInt(merge[item.coinAddress].balance) +
								BigInt(item.balance),
						},
					};
				} else {
					return { ...merge, [item.coinAddress]: item };
				}
			},
			{}
		);

		setUserTokenDetails(Object.values(mergeCoinBalance));
	};

	const fetchTokensList = async (client: AggregatorSDK) => {
		setIsLoadingTokenList(true);
		try {
			const { ok, response } = await client.apis.getAssets();
			if (ok) {
				setTokenList(response.data);
				client.updateAssetMaps(response.data);
			} else {
				NotificationService.makeToast(
					"Failed to load Assets",
					response.message,
					"error"
				);
			}
		} catch (e: any) {
			NotificationService.makeToast(
				"Failed to load Assets",
				e?.message && e.message,
				"error"
			);
		}
		setIsLoadingTokenList(false);
	};

	const onRefresh = async () => {
		if (fromToken && fromToken.coin) {
			if (fromQuantity) {
				fetchAndUpdateFromPrice(fromToken.coin);
			}
			fetchBalance(fromToken.address, fromToken.decimals);
		}
		if (toToken && toToken.coin && toQuantity) {
			fetchAndUpdateToPrice(toToken.coin);
		}

		if (client && fromToken && toToken && swapQuantityInfo.quantity) {
			fetchSwapDetails(
				client,
				fromToken,
				toToken,
				swapQuantityInfo.quantity,
				swapQuantityInfo.byAmountIn
			);
		}
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (client) {
			interval = setInterval(() => {
				onRefresh();
			}, 200000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [fromToken, toToken, fromQuantity, toQuantity, client]);
	const fetchSwapDetails = async (
		client: AggregatorSDK,
		from: TokenDetails,
		to: TokenDetails,
		quantity: number,
		isByAmountIn: boolean
	) => {
		setIsLoadingSwapDetails(true);
		setRoutVisualizationDetail(undefined);
		try {
			const swapRoute = await client.findBestSwapRoute(
				from.id,
				to.id,
				quantity,
				isByAmountIn,
				true,
				3
			);

			setSwapDetails(swapRoute);

			if (swapRoute.byAmountIn) {
				setToQuantity(
					new BigNumber(swapRoute.outputAmount)
						.div(new BigNumber(10).pow(to.decimals))
						.toNumber()
				);
			} else {
				setFromQuantity(
					new BigNumber(swapRoute.inputAmount)
						.div(new BigNumber(10).pow(from.decimals))
						.toNumber()
				);
			}
			transformSplits(swapRoute.splits, from, to);
		} catch (e: any) {
			NotificationService.makeToast(
				"Failed to load swap route",
				e?.message && e.message,
				"error"
			);
			setRoutVisualizationDetail(undefined);
			setSwapDetails(undefined);
		}
		setIsLoadingSwapDetails(false);
	};

	const fetchSwappableAssets = async (client: AggregatorSDK, id: string) => {
		setIsLoadingSwappableTokenList(true);
		try {
			const { ok, response } = await client.apis.getSwappableAssets(id);

			if (ok) {
				const swappableMap: { [key in string]: boolean } = {};
				const swappableAssetDetailsList: GetAssetsResponse[] =
					response.data.reduce((list: GetAssetsResponse[], item) => {
						swappableMap[item.toString()] = true;
						const tokenDetails = client.getAssetDetails(item.toString());
						if (tokenDetails) {
							list.push(tokenDetails);
						}
						return list;
					}, []);

				setSwappableAssetList(swappableAssetDetailsList);
				if (!toToken || !swappableMap[toToken.id]) {
					setToToken(
						swappableAssetDetailsList.find(
							(item) => item.address === DEFAULT_TARGET_TOKEN
						) ?? swappableAssetDetailsList.find((_) => true)
					);
				}
			} else {
				NotificationService.makeToast(
					"Failed to load Swappable Asset",
					response.message,
					"error"
				);
			}
		} catch (e: any) {
			NotificationService.makeToast(
				"Failed to load Swappable Asset",
				e?.message && e.message,
				"error"
			);
		}
		setIsLoadingSwappableTokenList(false);
	};
	const onSwitchToken = () => {
		const byAmountIn = swapQuantityInfo.byAmountIn;
		setSwitchLoading(true);
		setToPrice(fromPrice);
		setFromPrice(toPrice);
		setToToken(fromToken);
		setFromToken(toToken);
		setFromQuantity(toQuantity);
		setToQuantity(fromQuantity);
		setSwapQuantityInfo({
			quantity: byAmountIn ? fromQuantity : toQuantity,
			byAmountIn: !byAmountIn,
		});
		setSwitchLoading(false);
	};

	return (
		<>
			<Form
				layout="vertical"
				className={clsx({
					[styles.width100]: true,
					[styles.overflowScroll]: true,
				})}>
				<Row gutter={[0, 16]} className={clsx({ [styles.containerDiv]: true })}>
					<Col span={24}>
						<Space
							direction="vertical"
							size={16}
							className={clsx({ [styles.flexSpace]: true })}>
							<Row
								justify={"center"}
								className={clsx({ [styles.width100]: true })}>
								<Col span={8} xs={22} sm={22} md={8}>
									<Row
										justify={"space-between"}
										className={clsx({ [styles.width100]: true })}>
										<Col>
											<h5 className={styles.swapHeading}>Swap</h5>
										</Col>
										<Col>
											<Space
												size={8}
												className={clsx({
													[styles.flexSpace]: true,
												})}>
												<Button
													className={styles.roundedText}
													shape="round"
													styleType="neutral"
													loading={false}
													onClick={() => {
														setShowSlippageModal(true);
													}}
													size="middle">
													<Space size={4}>
														{slippagePercentage + "%"}{" "}
														<ChevronRightIcon />
													</Space>
												</Button>
												<Button
													shape="round"
													styleType="neutral"
													icon={<ReplaceIcon />}
													loading={false}
													onClick={() => {
														onRefresh();
													}}
													size="middle"></Button>
												<Button
													shape="round"
													styleType="neutral"
													icon={<HistoryIcon />}
													loading={false}
													onClick={onClickHistoryButton}
													size="large"></Button>
												<Button
													shape="round"
													styleType="neutral"
													icon={<SettingIcon />}
													loading={false}
													onClick={() => {
														setShowSettingModal(true);
													}}
													size="middle"></Button>
											</Space>
										</Col>
									</Row>
								</Col>
							</Row>
							<Row
								justify={"center"}
								className={clsx({ [styles.width100]: true })}>
								<Col span={8} xs={22} sm={22} md={8}>
									<Row
										justify={"space-between"}
										gutter={[0, 12]}
										className={clsx({ [styles.width100]: true })}>
										<Col span={24}>
											<FormItem
												className={`starship-input-field ${styles.inputFormItem}`}
												label={
													<Row justify="space-between">
														<Col>You pay</Col>
														{fromQuantity && fromPrice ? (
															<Col>
																{!isLoadingFromPrice ? (
																	<>
																		$
																		{new BigNumber(
																			fromPrice
																		)
																			.multipliedBy(
																				fromQuantity
																			)
																			.toFixed(
																				DEFAULT_PRECISION
																			)}
																	</>
																) : (
																	<Skeleton
																		className={
																			styles.inlineBlock
																		}
																		width={64}
																		height={10}
																	/>
																)}
															</Col>
														) : (
															<></>
														)}
													</Row>
												}>
												<Input
													type="number"
													value={fromQuantity}
													placeholder="0.00"
													disabled={!fromToken}
													onChange={(e) => {
														if (fromToken) {
															const quantity =
																handleNumberSanitizationWithPrecision(
																	+e.target.value,
																	fromToken?.decimals ??
																		0
																);
															setFromQuantity(quantity);

															setSwapQuantityInfo({
																quantity,
																byAmountIn: true,
															});
														}
													}}
													suffix={
														<Button
															className={styles.roundedText}
															shape="round"
															styleType="neutral"
															loading={isLoadingTokenList}
															disabled={
																tokenList.length == 0
															}
															onClick={() => {
																setShowFromTokenSelectModal(
																	true
																);
															}}
															size="middle">
															<Space size={4}>
																{fromToken ? (
																	<>
																		<GenericTokenIcon />
																		{fromToken.coin}
																	</>
																) : (
																	"Select coin"
																)}
																<CaretDown />
															</Space>
														</Button>
													}></Input>
											</FormItem>
										</Col>

										<Col className={styles.AlignContentCenter}>
											<Space className={styles.hight100}>
												<WalletIcon />
												<span>
													Balance:{" "}
													{!isBalanceLoading ? (
														<>
															{new BigNumber(
																fromWalletBalance
															).toFixed(2)}
															{fromToken?.coin ?? ""}
														</>
													) : (
														<Skeleton
															className={styles.inlineBlock}
															width={64}
															height={10}
														/>
													)}
												</span>

												{fromToken && !isBalanceLoading ? (
													<span
														className={styles.max}
														onClick={() => {
															setFromQuantity(
																fromWalletBalance
															);
															setSwapQuantityInfo({
																quantity:
																	fromWalletBalance,
																byAmountIn: true,
															});
														}}>
														Max
													</span>
												) : (
													<></>
												)}
											</Space>
										</Col>
										<Col>
											<Button
												className={styles.width100}
												icon={<ArrowVerticalIcon />}
												styleType="neutral"
												shape="round"
												disabled={switchLoading}
												loading={switchLoading}
												onClick={() => {
													onSwitchToken();
												}}
												size="middle"></Button>
										</Col>

										<Col span={24}>
											<FormItem
												className={`starship-input-field ${styles.inputFormItem}`}
												label={
													<Row justify="space-between">
														<Col>You receive</Col>
														{toQuantity && toPrice ? (
															<Col>
																{!isLoadingToPrice ? (
																	<>
																		$
																		{new BigNumber(
																			toPrice
																		)
																			.multipliedBy(
																				toQuantity
																			)
																			.toFixed(
																				DEFAULT_PRECISION
																			)}{" "}
																		{toQuantity &&
																		toPrice &&
																		fromQuantity &&
																		fromPrice
																			? `(${percentageDifference(
																					new BigNumber(
																						fromPrice
																					)
																						.multipliedBy(
																							fromQuantity
																						)
																						.toNumber(),
																					new BigNumber(
																						toPrice
																					)
																						.multipliedBy(
																							toQuantity
																						)
																						.toNumber()
																			  ).toFixed(
																					DEFAULT_PRECISION
																			  )}%)`
																			: ""}
																	</>
																) : (
																	<Skeleton
																		className={
																			styles.inlineBlock
																		}
																		width={64}
																		height={10}
																	/>
																)}
															</Col>
														) : (
															<></>
														)}
													</Row>
												}>
												<Input
													type="number"
													placeholder="0.00"
													value={toQuantity}
													onChange={(e) => {
														if (toToken) {
															const quantity =
																handleNumberSanitizationWithPrecision(
																	+e.target.value,
																	fromToken?.decimals ??
																		0
																);
															setToQuantity(quantity);
															setSwapQuantityInfo({
																quantity,
																byAmountIn: false,
															});
														}
													}}
													disabled={!toToken}
													suffix={
														<Button
															className={styles.roundedText}
															shape="round"
															styleType="neutral"
															loading={
																isLoadingSwappableTokenList
															}
															disabled={
																swappableAssetsList.length ==
																0
															}
															onClick={() => {
																setShowToTokenSelectModal(
																	true
																);
															}}
															size="middle">
															<Space size={4}>
																{toToken ? (
																	<>
																		<GenericTokenIcon />
																		{toToken.coin}
																	</>
																) : (
																	"Select coin"
																)}
																<CaretDown />
															</Space>
														</Button>
													}></Input>
											</FormItem>

											{routeVisualizationDetail && (
												<span className={styles.routeSpan}>
													<Space
														size={8}
														className={styles.pointer}
														onClick={() => {
															setShowSwapRoute(true);
														}}>
														<Routing />
														<span className={styles.text}>
															Trading Route
														</span>
														<span className={styles.details}>
															<span className={styles.text}>
																{`${routeVisualizationDetail.numberOfHops} hops + ${routeVisualizationDetail.pathList.length} Routes`}
															</span>
														</span>
														<ChevronRightIcon />
													</Space>
												</span>
											)}
										</Col>
										<Col span={24}>
											{
												<>
													<RenderIfElse
														condition={Boolean(
															suiSignerObject.toSuiAddress()
														)}
														render={
															<Button
																disabled={!swapDetails}
																className={
																	styles.width100
																}
																loading={
																	isLoadingSwapDetails ||
																	isSwapping
																}
																onClick={async () => {
																	setIsSwapping(true);
																	try {
																		if (
																			client &&
																			swapDetails
																		) {
																			let tx;
																			try {
																				tx =
																					await client.buildSwapTx(
																						swapDetails,
																						new BigNumber(
																							slippagePercentage
																						)
																							.div(
																								100
																							)
																							.toNumber(),
																						{
																							sponsored:
																								true,
																						}
																					);
																			} catch (e) {
																				throw {
																					message:
																						e,
																				};
																			}

																			const gaslessPayloadBase64 =
																				await SuiBlocks.buildGaslessTxPayloadBytes(
																					tx,
																					client.suiClient
																				);

																			const {
																				ok,
																				response:
																					{
																						data,
																						message,
																					},
																			} =
																				await client.apis.sponsorTransaction(
																					gaslessPayloadBase64,
																					suiSignerObject.address ??
																						"",
																					swapDetails
																				);
																			if (!ok) {
																				throw (
																					data as any
																				)?.message
																					? JSON.parse(
																							(
																								data as any
																							)
																								?.message
																					  )
																					: (
																							data as any
																					  )
																							?.message;
																			}

																			if (
																				suiSignerObject?.adapter &&
																				suiSignerObject.account
																			) {
																				const userSignature =
																					await suiSignerObject.adapter.signTransactionBlock(
																						{
																							//@ts-ignore
																							transactionBlock:
																								TransactionBlock.from(
																									data.txBytes
																								),
																							account:
																								suiSignerObject.account,
																						}
																					);

																				const {
																					ok,
																					response,
																				} =
																					await client.apis.executeSwap(
																						userSignature.transactionBlockBytes,
																						suiSignerObject
																							.account
																							.address,
																						userSignature.signature,
																						data.signature
																					);

																				console.log(
																					{
																						tx_bytes:
																							userSignature.transactionBlockBytes,
																						user_sig:
																							userSignature.signature,
																						gas_sig:
																							data.signature,
																						sender: suiSignerObject
																							.account
																							.address,
																					},
																					{
																						response,
																					}
																				);

																				if (ok) {
																					NotificationService.makeToast(
																						"Successful",
																						"Swap executed Successfully",
																						"success"
																					);
																					onRefresh();
																				} else {
																					throw Error(
																						response
																							?.data
																							?.message
																							? JSON.parse(
																									response
																										?.data
																										?.message
																							  )
																									?.message
																							: response
																									?.data
																									?.message
																					);
																				}
																			}
																		}
																	} catch (e: any) {
																		console.log(e);
																		let errorMessage =
																			e?.message?.includes(
																				"Insufficient balance"
																			)
																				? "You don't have sufficient balance to execute swap"
																				: e?.message
																				? e?.message
																				: "Something went wrong";

																		console.log(
																			errorMessage
																		);

																		NotificationService.makeToast(
																			"Swap Failed",
																			errorMessage ??
																				"Something went wrong",

																			"error"
																		);
																	}
																	setIsSwapping(false);
																}}
																size="large">
																Swap Assets
															</Button>
														}
														elseRender={
															<Button
																block={true}
																type="primary"
																color="white"
																size="large"
																// disabled={
																// 	!CONNECT_WALLET
																// }
																onClick={(e: any) => {
																	e.preventDefault();
																	onConnectWallet();
																}}>
																{t(
																	"header.connect_wallet"
																)}
															</Button>
														}
													/>
												</>
											}
										</Col>
										{fromQuantity && toQuantity ? (
											<>
												<Col
													className={styles.AlignContentCenter}>
													{!isLoadingSwapDetails ? (
														<Space
															className={styles.hight100}
															size={8}>
															<Space
																className={
																	styles.hight100
																}
																size={4}>
																{1}
																<span
																	className={
																		styles.smallSymbol
																	}>
																	{fromToken?.coin}{" "}
																</span>
															</Space>
															<ArrowHorizontalIcon
																className={
																	styles.arrowHorizontal
																}
															/>

															<Space
																className={
																	styles.hight100
																}
																size={4}>
																{toToken
																	? new BigNumber(
																			toQuantity
																	  )
																			.div(
																				fromQuantity
																			)
																			.toFixed(
																				toToken?.decimals
																			)
																	: ""}
																<span
																	className={
																		styles.smallSymbol
																	}>
																	{toToken?.coin}
																</span>
															</Space>
														</Space>
													) : (
														<Skeleton
															className={styles.inlineBlock}
															width={100}
															height={10}
														/>
													)}
												</Col>
											</>
										) : (
											<></>
										)}
									</Row>
								</Col>
							</Row>

							<Row
								justify={"center"}
								className={clsx({ [styles.width100]: true })}>
								<Col span={8}></Col>
							</Row>
						</Space>
					</Col>
				</Row>
			</Form>
			<MaxSlippageModal
				isVisible={showSlippageModal}
				slippage={slippagePercentage}
				onClose={() => {
					setShowSlippageModal(false);
				}}
				setSlippage={(item) => {
					setSlippagePercentage(item);
				}}
			/>
			<SettingModal
				isVisible={showSettingModal}
				slippage={slippagePercentage}
				onClose={() => {
					setShowSettingModal(false);
				}}
				setSlippage={(item) => {
					setSlippagePercentage(item);
				}}
			/>
			{routeVisualizationDetail && (
				<SwapRouteModal
					isVisible={showSwapRoute}
					onClose={() => {
						setShowSwapRoute(false);
					}}
					routeDetails={{
						destinationDetails: {
							tokenName: toToken?.coin ?? "",
							tokenSymbol: toToken?.coin ?? "",
							amount: (toQuantity || 0).toString(),
							address: toToken?.id ?? "",
						},
						sourceDetails: {
							tokenName: fromToken?.coin ?? "",
							tokenSymbol: fromToken?.coin ?? "",
							amount: (fromQuantity || 0).toString(),
							address: fromToken?.id ?? "",
						},
						routeVisualization: routeVisualizationDetail,
					}}
				/>
			)}
			<TokenSelectModal
				isVisible={showFromTokenSelectModal}
				userTokenDetails={userTokenDetails}
				priceObject={priceObject}
				tokenList={tokenList}
				setSelectedToken={setFromToken}
				onClose={() => {
					setShowFromTokenSelectModal(false);
				}}
			/>
			<TokenSelectModal
				isVisible={showToTokenSelectModal}
				priceObject={priceObject}
				userTokenDetails={userTokenDetails}
				tokenList={swappableAssetsList}
				setSelectedToken={setToToken}
				onClose={() => {
					setShowToTokenSelectModal(false);
				}}
			/>
		</>
	);
};

export default Swap;
