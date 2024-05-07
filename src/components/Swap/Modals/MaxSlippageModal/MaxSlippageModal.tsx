import { useEffect, useState } from "react";

import { Row, Col, Input, Modal, Button } from "@bluefin-exchange/starship-v2";
import { Radio, Space } from "antd";
import { ReactComponent as AddIcon } from "assets/icons/add.svg";
import { ReactComponent as Info } from "assets/icons/infoWarning.svg";
import { ReactComponent as SubtractIcon } from "assets/icons/subtract.svg";
import BigNumber from "bignumber.js";
import clsx from "clsx";

import { NotificationService } from "utils/notification.service";

import styles from "./MaxSlippageModal.module.scss";
import React from "react";

type MaxSlippageModalProps = {
	isVisible: boolean;
	slippage: number;
	onClose: () => void;
	setSlippage: (item: number) => void;
};

const MaxSlippageModal = (props: MaxSlippageModalProps) => {
	const { isVisible, onClose, setSlippage, slippage } = props;
	const SlippageDefaults = [
		{ Key: "0.1", value: 0.1 },
		{ Key: "0.3%", value: 0.3 },
		{ Key: "0.5%", value: 0.5 },
		{ Key: "1%", value: 1 },
	];
	const [slippageValue, setSlippageValue] = useState<string>("0");

	useEffect(() => {
		setSlippageValue(slippage.toString());
	}, [slippage]);

	const onSubmit = () => {
		if (!isNaN(+slippageValue)) {
			setSlippage(+slippageValue);
			onClose();
			resetState();
		} else {
			NotificationService.makeToast(
				"Error",
				"NaN while saving the slippage value",
				"error"
			);
		}
	};

	const resetState = () => {
		setSlippageValue(slippage.toString());
	};
	return (
		<Modal
			title={"Max. Slippage"}
			className={styles.model}
			destroyOnClose
			footer={
				+slippageValue > 1 ? (
					<Space align="start" className={styles.warning}>
						<Info /> Your transaction may fail.
					</Space>
				) : null
			}
			visible={isVisible}
			closable
			onCancel={() => {
				onClose();
				resetState();
			}}>
			<Row gutter={[0, 16]}>
				<Col span={24}>
					Your transaction will revert if the price changes unfavorably by more
					than this percentage.
				</Col>
				<Col span={24}>
					<Row gutter={[0, 16]}>
						<Col span={24}>
							<Input
								onChange={(event) => {
									const value = event.target.value.replace(
										/[^\d.]|(?<=\..*)\./g,
										""
									);
									if (
										!isNaN(+value) &&
										+value <= 100 &&
										+value >= 0.1
									) {
										setSlippageValue(value);
									}
								}}
								className={clsx({
									[styles.slippageInput]: true,
									[styles.warning]: +slippageValue > 1,
								})}
								placeholder="0.00%"
								value={`${slippageValue}%`}
								prefix={
									<SubtractIcon
										onClick={() => {
											if (+slippageValue > 1)
												setSlippageValue(
													new BigNumber(slippageValue)
														.minus(1)
														.toString()
												);
										}}
									/>
								}
								suffix={
									<AddIcon
										onClick={() => {
											if (+slippageValue < 99)
												setSlippageValue(
													new BigNumber(slippageValue)
														.plus(1)
														.toString()
												);
										}}
									/>
								}></Input>
						</Col>
						<Col span={24}>
							<Radio.Group
								className={styles.slippageGroup}
								value={+slippageValue}
								onChange={(e) => {
									setSlippageValue(e.target.value);
								}}
								size="middle"
								style={{ width: "100%" }}>
								<Row style={{ width: "100%" }}>
									{SlippageDefaults.map((item) => (
										<Col span={6}>
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
						</Col>
					</Row>
				</Col>
				<Col span={24}>
					<Button
						className={styles.buttonConfirmSlippage}
						size="large"
						style={{ width: "100%" }}
						onClick={() => onSubmit()}>
						Confirm Slippage
					</Button>
				</Col>
			</Row>
		</Modal>
	);
};

export default MaxSlippageModal;
