import { useEffect, useState } from "react";

import {
	Row,
	Col,
	Modal,
	Button,
	FormItem,
	Form,
	Space,
} from "@bluefin-exchange/starship-v2";
import { Radio } from "antd";
import { ReactComponent as AddIcon } from "assets/icons/add.svg";
import { ReactComponent as ArrowHorizontalIcon } from "assets/icons/arrows-horizontal.svg";
import { ReactComponent as ArrowVerticalIcon } from "assets/icons/arrows-vertical.svg";
import { ReactComponent as CaretDown } from "assets/icons/caret-down.svg";
import { ReactComponent as ChevronRightIcon } from "assets/icons/chevron-right.svg";
import { ReactComponent as GenericTokenIcon } from "assets/icons/ethGeneric.svg";
import { ReactComponent as HistoryIcon } from "assets/icons/history.svg";
import { ReactComponent as ReplaceIcon } from "assets/icons/replace.svg";
import { ReactComponent as SettingIcon } from "assets/icons/setting.svg";
import { ReactComponent as SubtractIcon } from "assets/icons/subtract.svg";
import { ReactComponent as WalletIcon } from "assets/icons/wallet.svg";
import BigNumber from "bignumber.js";
import clsx from "clsx";

import { NotificationService } from "utils/notification.service";

import styles from "./SwapRouteModal.module.scss";
import { SplitPaths } from "@bluefin-exchange/aggregator-sdk/build/src/interfaces";

type swapTokeDetail = {
	tokenName: string;
	tokenSymbol: string;
	amount: string;
	address: string;
};
type MaxSlippageModalProps = {
	isVisible: boolean;
	onClose: () => void;
	routeDetails: {
		destinationDetails: swapTokeDetail;
		sourceDetails: swapTokeDetail;
		splits: SplitPaths[];
	};
};

const SwapRouteModal = (props: MaxSlippageModalProps) => {
	const { isVisible, onClose, routeDetails } = props;

	const { sourceDetails, destinationDetails, splits } = routeDetails;

	const resetState = () => {};

	// Get all divs within the main container
	const mainContainer = document.getElementById("mainContainer");

	// Get all first-level child divs within the main container
	const divs = mainContainer?.children ?? [];

	// Initialize max width variable
	let maxWidth = 0;

	// Loop through all divs to find max width
	for (let i = 0; i < divs?.length; i++) {
		//@ts-ignore
		if (divs[i]?.offsetWidth) {
			//@ts-ignore
			const divWidth = divs[i].offsetWidth;
			if (divWidth > maxWidth) {
				maxWidth = divWidth;
			}
		}
	}
	console.log(maxWidth);
	// Set width of all divs to max width
	for (let i = 0; i < divs.length; i++) {
		//@ts-ignore
		if (divs[i]?.["style"]["width"]) {
			//@ts-ignore
			divs[i]["style"]["width"] = maxWidth + "px";
		}
	}
	return (
		<Modal
			title={"Routing"}
			className={styles.routeModal}
			destroyOnClose
			visible={isVisible}
			closable
			onCancel={() => {
				onClose();
				resetState();
			}}>
			<p className={styles.description}>
				Bluefin compared prices across multiple liquidity sources on the Ethereum
				network to find you the best route.
			</p>
			<Row
				className={clsx({
					[styles.width100]: true,
					[styles.overflowScroll]: true,
				})}
				id="mainContainer"
				style={{ overflow: "scroll" }}>
				<Col span={24}>
					<Row
						className={clsx({
							[styles.width100]: true,
							[styles.overflowScroll]: true,
						})}
						gutter={[0, 16]}
						justify={"space-between"}>
						<Col>
							<div className={styles.roundedTextLabel}>
								<Space size={4}>
									<GenericTokenIcon />
									<Space size={2}>
										{routeDetails.sourceDetails.amount}
										<p className={styles.symbol}>
											{routeDetails.sourceDetails.tokenSymbol}
										</p>
									</Space>
								</Space>
							</div>
						</Col>
						<Col>
							<div className={styles.roundedTextLabel}>
								<Space size={4}>
									<GenericTokenIcon />
									<Space size={2}>
										{routeDetails.destinationDetails.amount}
										<p className={styles.symbol}>
											{routeDetails.destinationDetails.tokenSymbol}
										</p>
									</Space>
								</Space>
							</div>
						</Col>
					</Row>
				</Col>
				<Col span={24}>
					<Row
						style={{ marginTop: "4px" }}
						gutter={[16, 16]}
						className={styles.parentRow}>
						{[...splits, ...splits].map((item) => {
							const edges = item.edges.reduce(
								(prv: { [key in string]: string }, currentValue) => {
									return {
										...prv,
										[currentValue.fromNode]: currentValue.toNode,
									};
								},
								{}
							);
							return (
								<>
									<Col span={24}>
										<Row
											className={clsx({
												[styles.overflowScroll]: true,
												[styles.hopDetailsSectionRow]: true,
											})}
											justify={"space-around"}
											gutter={[16, 16]}>
											<Col>
												<Space
													size={4}
													direction="vertical"
													className={styles.hopDetailSection}>
													<Row
														className={clsx({
															[styles.overflowScroll]: true,
														})}
														justify={"start"}
														gutter={[4, 4]}>
														<Col>
															<GenericTokenIcon />
														</Col>
														<Col>{"116.804"}</Col>
													</Row>

													{[0, 0, 0].map(() => (
														<Row
															className={clsx({
																[styles.overflowScroll]:
																	true,
																[styles.tiles]: true,
															})}
															justify={"space-around"}
															gutter={[16, 8]}>
															<Col>
																Uniswap V3 - 0.3% Pool
															</Col>
															<Col>26%</Col>
														</Row>
													))}
												</Space>
											</Col>
											<Col>
												<Space
													size={4}
													direction="vertical"
													className={styles.hopDetailSection}>
													<Row
														className={clsx({
															[styles.overflowScroll]: true,
														})}
														justify={"start"}
														gutter={[4, 4]}>
														<Col>
															<GenericTokenIcon />
														</Col>
														<Col>{"116.804"}</Col>
													</Row>

													{[0, 0, 0].map(() => (
														<Row
															className={clsx({
																[styles.overflowScroll]:
																	true,
																[styles.tiles]: true,
															})}
															justify={"space-around"}
															gutter={[16, 8]}>
															<Col span={18}>
																Uniswap V3 - 0.3% Pool
															</Col>
															<Col span={6}>26%</Col>
														</Row>
													))}
												</Space>
											</Col>
											<Col>
												<Space
													size={4}
													direction="vertical"
													className={styles.hopDetailSection}>
													<Row
														className={clsx({
															[styles.overflowScroll]: true,
														})}
														justify={"start"}
														gutter={[4, 4]}>
														<Col>
															<GenericTokenIcon />
														</Col>
														<Col>{"116.804"}</Col>
													</Row>

													{[0, 0, 0].map(() => (
														<Row
															className={clsx({
																[styles.overflowScroll]:
																	true,
																[styles.tiles]: true,
															})}
															justify={"space-around"}
															gutter={[16, 8]}>
															<Col>
																Uniswap V3 - 0.3% Pool
															</Col>
															<Col>26%</Col>
														</Row>
													))}
												</Space>
											</Col>
											<Col>
												<Space
													size={4}
													direction="vertical"
													className={styles.hopDetailSection}>
													<Row
														className={clsx({
															[styles.overflowScroll]: true,
														})}
														justify={"start"}
														gutter={[4, 4]}>
														<Col>
															<GenericTokenIcon />
														</Col>
														<Col>{"116.804"}</Col>
													</Row>

													{[0, 0, 0].map(() => (
														<Row
															className={clsx({
																[styles.overflowScroll]:
																	true,
																[styles.tiles]: true,
															})}
															justify={"space-around"}
															gutter={[16, 8]}>
															<Col>
																Uniswap V3 - 0.3% Pool
															</Col>
															<Col>26%</Col>
														</Row>
													))}
												</Space>
											</Col>
										</Row>
									</Col>
								</>
							);
						})}
					</Row>
				</Col>
			</Row>
		</Modal>
	);
};

export default SwapRouteModal;
