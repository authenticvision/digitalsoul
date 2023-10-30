import { Alert, Layout } from '@/components/ui'
import NextHead from 'next/head'

const ErrorPage = ({ status, message = '', ...props }) => {
	const titles = {
		403: 'Forbidden',
		401: 'Unauthorized'
	}

	const errorMsgs = {
		403: "Forbidden. You can't access this resource",
		401: "Unauthorized. You need to connect with your wallet first"
	}

	return (
		<>
			<NextHead>
				<title>DigitalSoul - {titles[status]}</title>
			</NextHead>

			<Layout>
				<div className="page container w-full py-5 px-2 my-0 mx-auto">
					<main className="flex flex-col">
						<div className="flex justify-center py-2">
							<Alert type='error' text={errorMsgs[status]} />
						</div>
					</main>
				</div>
			</Layout>
		</>
	)
}

export default ErrorPage
