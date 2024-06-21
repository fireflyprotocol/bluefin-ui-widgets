import { useEffect, useState } from "react";

import { Row, Col, Modal, Button, FormItem, Form } from "@bluefin-exchange/starship-v2";
import { Radio } from "antd";
import { ReactComponent as AddIcon } from "assets/icons/add.svg";
import { ReactComponent as SubtractIcon } from "assets/icons/subtract.svg";
import BigNumber from "bignumber.js";
import clsx from "clsx";

import { NotificationService } from "utils/notification.service";

import styles from "./SettingModal.module.scss";

type MaxSlippageModalProps = {
	isVisible: boolean;
	slippage: number;
	onClose: () => void;
	setSlippage: (item: number) => void;
};

export enum GasToken {
	SUI = "SUI",
	WUSDT = "WUSDT",
	WUSDC = "WUSDC",
}

const SettingModal = (props: MaxSlippageModalProps) => {
	const { isVisible, onClose } = props;
	const GasTokenMap = [
		{ Key: GasToken.SUI, value: GasToken.SUI },
		{ Key: GasToken.WUSDC, value: GasToken.WUSDC },
		{ Key: GasToken.WUSDT, value: GasToken.WUSDT },
	];
	const RoutingOptionMap = [
		{ Key: "Direct Routes", value: "Direct Routes" },
		{ Key: "Split Routes", value: "Split Routes" },
	];
	// const GasToken = [
	// 	{ Key: "0.1", value: 0.1 },
	// 	{ Key: "0.3%", value: 0.3 },
	// 	{ Key: "0.5%", value: 0.5 },
	// 	{ Key: "1%", value: 1 },
	// ];

	const resetState = () => {};
	return (
		<Modal
			title={"Setting"}
			className={styles.model}
			destroyOnClose
			visible={isVisible}
			closable
			onCancel={() => {
				onClose();
				resetState();
			}}>
			<Form
				layout="vertical"
				className={clsx({
					[styles.width100]: true,
					[styles.overflowScroll]: true,
				})}>
				<Row
					className={clsx({
						[styles.width100]: true,
						[styles.overflowScroll]: true,
					})}
					gutter={[0, 16]}>
					<Col span={24}>
						<FormItem
							className={`starship-input-field ${styles.formItem}`}
							label={"Pay Gas Fees In:"}>
							<Radio.Group
								className={styles.slippageGroup}
								value={GasToken.SUI}
								size="middle"
								style={{ width: "100%" }}>
								<Row style={{ width: "100%" }}>
									{GasTokenMap.map((item) => (
										<Col span={8}>
											<Radio.Button
												disabled={true}
												className={styles.slippageOption}
												style={{ width: "100%" }}
												value={item.value}>
												{item.Key}
											</Radio.Button>
										</Col>
									))}
								</Row>
							</Radio.Group>
						</FormItem>
					</Col>
					<Col span={24}>
						<FormItem
							className={`starship-input-field ${styles.formItem}`}
							label={"Routing:"}>
							<Radio.Group
								disabled={true}
								className={styles.slippageGroup}
								value={"Direct Routes"}
								size="middle"
								style={{ width: "100%" }}>
								<Row style={{ width: "100%" }}>
									{RoutingOptionMap.map((item) => (
										<Col span={12}>
											<Radio.Button
												className={styles.slippageOption}
												style={{ width: "100%" }}
												value={item.value}>
												{item.Key}
											</Radio.Button>
										</Col>
									))}
								</Row>
							</Radio.Group>
						</FormItem>
					</Col>
					<Col span={24}>
						<Button
							disabled={true}
							className={styles.buttonConfirmSlippage}
							size="large"
							style={{ width: "100%" }}
							onClick={() => {}}>
							Save Setting
						</Button>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default SettingModal;
