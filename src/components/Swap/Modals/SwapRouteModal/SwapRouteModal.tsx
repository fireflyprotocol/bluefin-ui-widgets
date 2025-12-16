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
import { ReactComponent as GenericTokenIcon } from "assets/icons/ethGeneric.svg";
import clsx from "clsx";

import { DEFAULT_PRECISION } from "constants/Common";
import { RouteVisualizationDetail } from "components/Swap/Swap";

import styles from "./SwapRouteModal.module.scss";

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
		routeVisualization: {
			numberOfHops: number;
			numberOfExchanges: number;
			pathList: string[];
			pathDetails: RouteVisualizationDetail;
		};
	};
};

const SwapRouteModal = (props: MaxSlippageModalProps) => {
	const { isVisible, onClose, routeDetails } = props;

	const { sourceDetails, destinationDetails, routeVisualization } = routeDetails;
	return (
		<Modal
			title={"Routing"}
			className={styles.routeModal}
			destroyOnClose
			visible={isVisible}
			closable
			onCancel={() => {
				onClose();
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
										{(+routeDetails.sourceDetails.amount).toFixed(
											DEFAULT_PRECISION
										)}
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
										{(+routeDetails.destinationDetails
											.amount).toFixed(DEFAULT_PRECISION)}
										<p className={styles.symbol}>
											{routeDetails.destinationDetails.tokenSymbol}
										</p>
									</Space>
								</Space>
							</div>
						</Col>
					</Row>
				</Col>
				<> {console.log(routeVisualization)}</>
				<Col span={24} style={{ paddingRight: "24px", paddingLeft: "24px" }}>
					<Row
						style={{ marginTop: "4px" }}
						gutter={[0, 0]}
						className={styles.parentRow}>
						{routeVisualization.pathList.map((item, index) => {
							const hops = routeVisualization.pathDetails[item].pathDetail;
							const lastIndex = routeVisualization.pathList.length - 1;
							const [_, ...path] =
								routeVisualization.pathDetails[item].path;
							return (
								<>
									<Col
										className={clsx({
											[styles.fullVerticalLine]:
												lastIndex !== index,
											[styles.hopeDetailsCol]: true,
										})}
										span={24}>
										<div className={styles.index_dashed}></div>
										<Row
											className={clsx({
												[styles.overflowScroll]: true,
												[styles.hopDetailsSectionRow]: true,
												[styles.fullHorizontalLine]: true,
											})}
											justify={"space-around"}
											align={"middle"}
											gutter={[16, 16]}>
											<Col
												className={clsx({
													[styles.tiles]: true,
												})}>
												{
													+(
														(routeVisualization.pathDetails[
															item
														].quantityIn /
															+sourceDetails.amount) *
														100
													).toFixed(DEFAULT_PRECISION)
												}
												%
											</Col>
											{path.map((item) => {
												const pathDetails = hops[item];
												return (
													<Col>
														<Space
															size={4}
															direction="vertical"
															className={clsx({
																[styles.hopBackground]:
																	true,
																[styles.hopDetailSection]:
																	true,
															})}>
															<Row
																className={clsx({
																	[styles.overflowScroll]:
																		true,
																})}
																justify={"space-between"}
																gutter={[4, 4]}>
																<Col span={18}>
																	<GenericTokenIcon />
																	{pathDetails.name}
																</Col>
															</Row>

															{pathDetails.exchangesDetails.map(
																(item) => (
																	<Row
																		className={clsx({
																			[styles.overflowScroll]:
																				true,
																			[styles.tiles]:
																				true,
																		})}
																		justify={
																			"space-between"
																		}
																		gutter={[16, 8]}>
																		<Col>
																			{item.name}
																		</Col>
																		<Col>
																			{
																				+(
																					(item.quantity /
																						pathDetails.quantityOut) *
																					100
																				).toFixed(
																					DEFAULT_PRECISION
																				)
																			}
																			%
																		</Col>
																	</Row>
																)
															)}
														</Space>
													</Col>
												);
											})}
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
