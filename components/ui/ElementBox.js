const ElementBox = ({ title, children, ...props }) => {
	return (
		<div className="collapse bg-[#29303f] collapse-arrow border rounded-lg border-raven-700">
			<input type="checkbox" />
			<div className="collapse-title text-2xl font-bold">
				{title}
			</div>

			<div className="collapse-content">
				{children}
			</div>
		</div>
	)
}

export default ElementBox
