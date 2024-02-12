import { useState, useEffect } from 'react'
import { cn, inChunks } from '@/lib/utils'

const SelectableCard = ({ item, selected, disabled, ...props }) => {
	const classNames = cn(
		'h-auto max-w-full',
		'border border-2',
		selected ? 'border-shark-500' : 'border-slate-300',
		disabled ? 'cursor-not-allowed' : 'cursor-pointer'
	)

	return (
		<div onClick={props.onClick}>
			<img src={item.assetURL} className={classNames} />
		</div>
	)
}

const SelectableCardList = ({ onChange, items, onSelect, disabled, ...props}) => {
	const [selectedCardId, setSelectedCardId] = useState()

	const onSelectCard = (cardId) => {
		if (disabled) {
			return
		}

		setSelectedCardId(cardId)

		const item = items.find((item) => item.id == cardId)
		onSelect(item)
	}

	useEffect(() => {
		return () => {
			setSelectedCardId(null)
		}
	}, [])

	return (
		<>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{
					inChunks(items, 3).map((row, index) => (
						<div className="grid gap-4" key={index}>
							{
								row.map((item) => (
									<SelectableCard item={item}
													key={item.id}
													disabled={disabled}
													onClick={(e) => onSelectCard(item.id)}
													selected={item.id == selectedCardId} />
								))
							}
						</div>
					))
				}
			</div>
		</>
	)
}

export default SelectableCardList
