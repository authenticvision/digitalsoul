const Alert = ({ text, type = 'error', ...props }) => {
	// TODO: Replace this with some nice svg and improve this component
	let icon = {
		error: '×',
		warning: '!'
	}[type];

	return (
		<div className="flex text-center p-1 rounded bg-red-600 text-white my-2">
			<span className="mx-2">
				{icon}
			</span>

			<p>
				{text}
			</p>
		</div>
	)
}

export default Alert
