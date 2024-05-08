---
title: De-nesting Opensearch
date: 2024-05-01 21:09:30
tags:
- es
- opensearch
- elasticsearch
- typescript
- opensearch-typescript
---


![Nest](/images/bees-nest.jpg)
ES is a powerful tool for searching through documents, providing developers with powerful abstractions to construct complex queries, often having a deeply nested structure, which can become deeply nested at times. Is this nest more like a bee nest leading to stings? Or a comfy bird nest? Lets do some examples and see where we go. NOTE examples used will make use of the sample data available at : `/_dashboards/app/home#/tutorial_directory`.

## Aggs - Aggregations

Using `opensearch_dashboards_sample_data_flights`, lets derive a histogram of the average by month, for each country. Thi query is as follows:

```json
POST opensearch_dashboards_sample_data_flights/_search
{
  "size": 0, 
  "aggs": {
    "country": {
      "terms": {
        "field": "DestCountry",
        "size": 10
      },
      "aggs": {
        "histogram": {
          "date_histogram": {
            "field": "timestamp",
            "interval": "week"
          },
          "aggs": {
            "avg_price": {
              "avg": {
                "field": "AvgTicketPrice"
              }
            }
          }
        }
      }
    }
  }
}
```
And the returned JSON is as follows:
```json
{
  "took": 14,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "country": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 3187,
      "buckets": [
        {
          "key": "IT",
          "doc_count": 2371,
          "histogram": {
            "buckets": [
              {
                "key_as_string": "2024-04-15T00:00:00.000Z",
                "key": 1713139200000,
                "doc_count": 399,
                "avg_price": {
                  "value": 579.1077163619804
                }
              },
              ...
```

 Without the guard-rails of a type-system, some of us/most of us (this being true of myself), if asked would have a very hard time parsing this response to iterate and drill-down to the `value` giving the actual value for a given month. Likewise writing the aggs query, remembering the correct field names exactly, and the exact structure is difficult to say the least, and frankly, annoying and frustrating. You're left reverting to the Dev Tools tab in the ES console to write you queries and bring them back into your IDE as a work around for lack of IDE support. But there is no option for parsing the response. Closest thing is to copy output JSON ans use a tool such as [quicktype](https://quicktype.io) to generate your typescript types with something like:

```bash
quicktype source/_posts/flights-aggs.json -o source/_posts/flights-aggs.ts
```

This will generate types for your response:

```typescript
export interface FlightsAggs {
    took:         number;
    timed_out:    boolean;
    _shards:      Shards;
    hits:         Hits;
    aggregations: Aggregations;
}
....
```

Whilst this makes things bearable for us, it's still a very discontinuous workflow, of navigating between Dev Tools, bash and your IDE, and maybe even the Discover Tab to check those pesky field names. Wouldn't it be nice if the IDE did all the heavy lifting for you instead? Wouldn't it be great if you could write the same JSON in the Dev Tools as in your `typescript` project? We'll now you can with [opensearch-typescript](https://www.npmjs.com/package/opensearch-typescript). With this library, you only need to use a tool like `quicktype` once to generate the type of your Document in your index, and then you can stay happily safe and home in your IDE.


## Opensearch-Typescript
This library can be used to empower your IDE with types that provide you with effective guard-rails for ES. Let's create a unique type for our aggregation from earlier:
 
```typescript
    type AvgByMonthForEachCountrySearch = Search<Flight, {
        country: {
            agg: "terms",
            aggs: {
                histogram: {
                    agg: "date_histogram",
                    aggs: {
                        avg_price: {
                            agg: "avg"
                        }
                    }
                }
            }
        }
    }>
```
The combination of the `Flight` type with the type defined with the brackets: `{ country ...}` is enough to create guard rails for the query, and the response. From the `Flight` type, we know all the `Fields` in our document, and so the IDE is able to give us back our old friend: auto-complete.
![AverageTicketPrice](/images/posts/denesting-opensearch/AverageTicketPrice.png)

But the best news is yet to come, we can now parse that nested JSON response with no problem thanks to the compiler. Using the custom client: `TypescriptOSProxyClient`. We can get a strongly-typed response from ES:

```typescript
    const result = await tsClient.searchTS({body : search, index : "opensearch_dashboards_sample_data_flights"})

    console.log(result.aggregations.country.buckets.flatMap(c => c.histogram.buckets.flatMap(h => ({
        country: c.key,
        avg_price: h.avg_price.value,
        date: new Date(h.key_as_string)
    }))))
```

With all of this code being type-safe:
![county](/images/posts/denesting-opensearch/county.png)

Checkout my package on [github](https://github.com/derrops-net/opensearch-typescript#readme), all feedback is welcome.





Derrops.
