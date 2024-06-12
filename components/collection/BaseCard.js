
const BaseCard = ({ title, ...props }) => {
	return (
		<div className="card border border-secondary w-full shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {props.children}
      </div>
    </div>
	)
}

export default BaseCard
