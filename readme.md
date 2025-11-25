# DNS 聚合查询服务

## 后端 DNS 列表

目前接入的后端 DNS 查询服务包含:

* Google Public DNS
	* [文档](https://developers.google.com/speed/public-dns/docs/doh)
* DNSPod Public DNS
	* [文档](https://cloud.tencent.com/document/product/302/110784)
* Ali Public DNS
	* [文档](https://www.alidns.com/knowledge?type=SETTING_DOCS)
* 360 Public DNS
	* [文档](https://sdns.360.net/dnsPublic.html#course)

(后端 DNS 响应时间若超过 3000 毫秒, 我们将会直接中断对其的查询请求)

## 使用方式

> GET `https://dns.firok.space/dns-query?name={host}`

example: `https://dns.firok.space/dns-query?name=baidu.com`

```json5
/* response body */
{
  "msg": "ok",
  "data": {
    "google-public-dns": { /* Promise<DNSResponse> */ },
    "dns-pod-public-dns": { /* Promise<DNSResponse> */ },
    "ali-public-dns": { /* Promise<DNSResponse> */ },
    "360-public-dns": { /* Promise<DNSResponse> */ }
  }
}
```

```json5
/* Promise<DNSResponse> format - successful */
{
  "status": "fulfilled",
  "value": { /* DNSResponse */ }
}
```

```json5
/* Promise<DNSResponse> format - timeout */
{
  "status": "rejected",
  "reason": "timeout"
}
```

(`DNSResponse` 格式详情可查阅上述后端 DNS 文档)
