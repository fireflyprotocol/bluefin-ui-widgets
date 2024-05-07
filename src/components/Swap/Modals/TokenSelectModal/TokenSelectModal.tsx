import { useEffect, useState } from "react";

import { Row, Col, Input, Modal, Button, Space } from "@bluefin-exchange/starship-v2";
import { CoinAsset } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { Divider } from "antd";
import { ReactComponent as SearchInput } from "assets/icons/searchInput.svg";
import { ReactComponent as GeneralIcon } from "assets/icons/solGeneral.svg";
import BigNumber from "bignumber.js";
import clsx from "clsx";

import { DEFAULT_PRECISION } from "constants/Common";
import { TokenDetails } from "components/Swap/Swap";
import { sanitizeAccountAddress } from "utils/utils";

import styles from "./TokenSelectModal.module.scss";
import React from "react";

type TokenSelectModalProps = {
	isVisible: boolean;
	tokenList: TokenDetails[];
	setSelectedToken: (tokenData: TokenDetails | undefined) => void;
	userTokenDetails: CoinAsset[];
	priceObject: { [key in string]: { price: number; symbol: string } };
	onClose: () => void;
};
const ViewTile = (props: {
	onClick: (id: string) => void;
	coinSymbol: string;
	coinName: string;
	id: string;
	showBalance?: boolean;
	price?: number;
	balance?: string;
	iconUrl?: string;
}) => {
	const {
		coinName,
		coinSymbol,
		id,
		balance,
		onClick,
		price,
		showBalance = false,
	} = props;
	return (
		<Row
			className={styles.viewTile}
			justify={"space-between"}
			onClick={() => {
				onClick(id);
			}}>
			<Col>
				<Space align="start" size={12}>
					<GeneralIcon />
					<Space direction={"vertical"} align="start" size={0}>
						<div className={styles.title}>{coinSymbol.toUpperCase()} </div>
						<div className={styles.subInfo}>{coinName}</div>
					</Space>
				</Space>
			</Col>
			{showBalance ? (
				<Col>
					<Space direction={"vertical"} align="end" size={0}>
						<div className={styles.title}>
							{balance ? balance : 0.0} {coinSymbol.toUpperCase()}
						</div>
						{price && (
							<div className={styles.subInfo}>
								$
								{new BigNumber(balance ?? "0")
									.multipliedBy(price)
									.toFixed(DEFAULT_PRECISION)}
							</div>
						)}
					</Space>
				</Col>
			) : (
				<></>
			)}
		</Row>
	);
};

const TokenSelectModal = (props: TokenSelectModalProps) => {
	const { isVisible, onClose, setSelectedToken, userTokenDetails, priceObject } = props;
	const [tokenList, setTokenList] = useState(props.tokenList);
	const [searchQuery, setSearchQuery] = useState("");
	const topToken = props.tokenList.slice(0, 3);
	const [ownTokens, setOwnTokens] = useState<TokenDetails[]>([]);
	const onSelect = (id: string) => {
		setSelectedToken(props.tokenList.find((item) => item.id == id));
		onClose();
	};
	useEffect(() => {
		const searchDebounce = setTimeout(() => {
			const filteredList = props.tokenList.filter((item) => {
				return (
					searchQuery == "" ||
					item.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.address.toLowerCase().includes(searchQuery.toLowerCase())
				);
			});

			setTokenList(filteredList);

			setOwnTokens(
				filteredList.reduce(
					(previousArray: TokenDetails[], token: TokenDetails) => {
						let userToken = userTokenDetails.find((item) => {
							const addressSplit = item.coinAddress.split(":");
							addressSplit[0] = sanitizeAccountAddress(
								addressSplit[0],
								"SUI"
							);

							return addressSplit.join(":") == token.address;
						});
						if (userToken) {
							previousArray.push({
								...token,
								balance: new BigNumber(userToken.balance.toString())
									.div(new BigNumber(10).pow(token.decimals))
									.toString(),
							});
							return previousArray;
						}
						return previousArray;
					},
					[]
				)
			);
		}, 100);

		return () => {
			clearTimeout(searchDebounce);
		};
	}, [searchQuery, props.tokenList, props.userTokenDetails]);

	return (
		<Modal
			title={"Select Token"}
			className={styles.model}
			destroyOnClose
			visible={isVisible}
			closable
			onCancel={() => {
				onClose();
			}}>
			<Row gutter={[0, 16]}>
				<Col span={24}>
					<Row gutter={[0, 16]}>
						<Col span={24}>
							<Input
								prefix={<SearchInput />}
								suffix={<></>}
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
								}}
								className={""}
								placeholder="Search token name or paste address"
							/>
						</Col>
						{topToken.length ? (
							<>
								<Col span={24}>
									<Space>
										{topToken.map((item) => {
											return (
												<Button
													className={clsx({
														["starship-btn-neutral"]: true,
														[styles.roundedText]: true,
													})}
													onClick={() => {
														onSelect(item.id);
													}}
													shape="round"
													styleType="neutral"
													loading={false}
													size="middle">
													<Space size={4}>
														<GeneralIcon />
														{item.coin.toUpperCase()}
													</Space>
												</Button>
											);
										})}
									</Space>
								</Col>
								<Col span={24}>
									<Divider className={styles.divider} />
								</Col>
							</>
						) : (
							<></>
						)}
						<Col span={24} className={styles.overflowScrollTokenList}>
							<Space
								direction={"vertical"}
								size={18}
								className={styles.width100}>
								<Row gutter={[0, 8]}>
									<Col span={24}>
										<h3>Your Assets</h3>
									</Col>
									{ownTokens.length ? (
										ownTokens.map((item) => {
											return (
												<Col span={24}>
													<ViewTile
														onClick={onSelect}
														coinName={item.coin}
														coinSymbol={item.coin}
														balance={item.balance}
														id={item.id}
														price={
															priceObject[item.address]
																?.price
														}
														showBalance
													/>
												</Col>
											);
										})
									) : (
										<Col span={24} className={styles.textAlignCenter}>
											No Data
										</Col>
									)}
								</Row>
								<Row gutter={[0, 16]}>
									<Col span={24}>
										<h3>Trending</h3>
									</Col>
									{tokenList.length > 0 ? (
										tokenList.map((item) => {
											return (
												<Col span={24}>
													<ViewTile
														onClick={onSelect}
														coinName={item.name ?? item.coin}
														coinSymbol={item.coin}
														id={item.id}
													/>
												</Col>
											);
										})
									) : (
										<Col span={24} className={styles.textAlignCenter}>
											No Data
										</Col>
									)}
								</Row>
							</Space>
						</Col>
					</Row>
				</Col>
			</Row>
		</Modal>
	);
};

export default TokenSelectModal;
