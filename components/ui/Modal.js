const Modal = ({ refObj, onOpen, onClose, children, ...props }) => {
	return (
		<dialog ref={refObj} id="nft-modal" className="modal">
			<div className="modal-box">
				<div>
					{children}
				</div>

				<div className="modal-action">
					<form method="dialog">
						<button type="submit" onClick={onClose}
								className="btn">
							Close
						</button>
					</form>
				</div>
			</div>
		</dialog>
	)
}

export default Modal
