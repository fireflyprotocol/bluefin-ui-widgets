import Loading from "./Icons/Loading";
import Bell from "./Icons/Bell";
import Check from "./Icons/Check";
import Close from "./Icons/Close";
import Warning from "./Icons/Warning";


export default function Toast({
	type,
	title,
	message,
	dismiss,
	id,
}: {
	type: "error" | "success" | "loading" | "info";
	title: string;
	message: string;
	dismiss: (id: string) => void;
	id: string;
}) {
	return (
		<div className="inner">
			<span className="icon">
				{type === "error" ? (
					<Warning />
				) : type === "loading" ? (
					<Loading />
				) : type === "success" ? (
					<Check />
				) : (
					<Bell />
				)}
			</span>
			<b>{title}</b>
			<p data-testid="message">{message}</p>
			{/* <a className="test" href="#" title="View More">
				View More
			</a> */}
			<span
				onClick={(_evt) => {
					dismiss(id);
				}}
				className="cclose">
				<Close fillColor="var(--base-700)" width={16} height={16}></Close>
			</span>
		</div>
	);
}
