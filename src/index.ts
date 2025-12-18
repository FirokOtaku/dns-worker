
const ResponseHeaders = new Headers()
ResponseHeaders.append('Content-Type', 'application/json')
ResponseHeaders.append('Access-Control-Allow-Origin', '*')

const TimeoutBackendQuery = 3000

function buildResponse(body: object, statusCode: number): Response
{
	const bodyContent= JSON.stringify({
		...body,
		code: statusCode,
	})

	return new Response(bodyContent, {
		status: statusCode,
		headers: ResponseHeaders,
	})
}

const KeyHostname = 'name'

function limitedFetch(asyncFunction: () => Promise<any>, timeout = TimeoutBackendQuery): Promise<object>
{
	return Promise.race([
		new Promise((resolve, reject) => {
			asyncFunction()
				.then(res => res.json())
				.then(resolve)
				.catch(reject)
		}),
		new Promise((resolve, reject) => {
			setTimeout(() => reject('timeout'), timeout)
		}),
	]) as Promise<object>
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url)
		const params = url.searchParams
		const path = url.pathname
		switch (path)
		{
			case '/dns-query':
			case '/dns-query/':
			{
				const host = params.get(KeyHostname) // 本次要处理的 host
				if(host == null)
				{
					return buildResponse({
						msg: 'Bad Request',
						desc: [
							`Missing request parameter '${KeyHostname}'`
						],
					}, 400)
				}
				else if(host == '')
				{
					return buildResponse({
						msg: 'Bad Request',
						desc: [
							`'${KeyHostname}' request parameter could not be empty`,
						],
					}, 400)
				}
				else
				{
					try
					{
						const listResult = await Promise.allSettled([
							limitedFetch(async () => await fetch(`https://dns.google/resolve?name=${host}`)),
							limitedFetch(async () => await fetch(`https://doh.pub/dns-query?name=${host}`)),
							limitedFetch(async () => await fetch(`https://dns.alidns.com/resolve?name=${host}`)),
							limitedFetch(async () => await fetch(`https://doh.360.cn/resolve?name=${host}`)),
							// todo more
						])

						const [
							resultGooglePublicDns,
							resultDnsPodPublicDns,
							resultAliPublicDns,
							result360PublicDns,
						] = listResult

						return buildResponse({
							msg: 'ok',
							data: {
								'google-public-dns': resultGooglePublicDns,
								'dns-pod-public-dns': resultDnsPodPublicDns,
								'ali-public-dns': resultAliPublicDns,
								'360-public-dns': result360PublicDns,
							},
						}, 200)
					}
					catch (any)
					{
						return buildResponse({
							msg: 'Internal Error',
							desc: 'Error when requesting backend services',
						}, 500)
					}
				}
			}
			default:
			{
				return buildResponse({
					msg: 'DNS Aggregation HTTP Service',
					desc: [
						`Providing '${KeyHostname}' request parameter to start querying. example: /dns-query?${KeyHostname}=baidu.com`,
						`Access GitHub repo for more information`,
						`Version: 1.1.0`,
						`Author: Firok`,
						`Repo: https://github.com/FirokOtaku/dns-worker`,
					],
				}, 200)
			}
		}
	},
} satisfies ExportedHandler<Env>;
