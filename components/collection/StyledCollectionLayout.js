import React from "react"
import { Logo } from '@/components/ui'

const StyledCollectionLayout = ({ cssClass, ...props}) => {
	return (
		// This wraps the complete page into the cssClass .collection-[CSN].
		//      Example: when CSN=ABCD, the value is .collection-abcd
		// This class-wrapping enables tenants to write collection-specific CSS files without too much risk of spill-over to
		// other collections, even when multiple Layout components are assembled on one page.

		// Note the .layout class in CSS can be considered similar to a plain document's body.
		<div>
			<div className="layout">
				<div className="mx-auto min-h-screen flex flex-col">
					<div className="w-full max-w-3xl mx-auto">
						{props.children}
					</div>
				</div>
			</div>
		</div>
	)
}

export default StyledCollectionLayout
