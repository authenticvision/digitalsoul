import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const SelectableCard = ({ item, selected, ...props }) => {
	const classNames = cn(
		selected ? 'border border-red-600' : 'border border-gray-300'
	)

	return (
		<div onClick={props.onClick} className={classNames}>
			{item.id}
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
			console.log('running the unmount function')
			setSelectedCardId(null)
		}
	}, [])

	return (
		<>
			{
				items.map((item) => (
					<SelectableCard item={item}
									key={item.id}
									onClick={(e) => onSelectCard(item.id)}
									selected={item.id == selectedCardId} />
				))
			}
		</>
	)
}

export default SelectableCardList
