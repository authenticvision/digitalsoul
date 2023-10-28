import { cn } from '@/lib/utils'

const Loading = ({ size = 'lg', ...props }) => {
	const sizes = {
		'xs': 'loading-xs',
		'sm': 'loading-sm',
		'md': 'loading-md',
		'lg': 'loading-lg'
	}

	const rootClassName = cn(
		"loading loading-ring",
		sizes[size]
	)

	return (
		<span className={rootClassName}></span>
	)
}

export default Loading
