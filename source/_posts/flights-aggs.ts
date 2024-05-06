// To parse this data:
//
//   import { Convert, FlightsAggs } from "./file";
//
//   const flightsAggs = Convert.toFlightsAggs(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface FlightsAggs {
    took:         number;
    timed_out:    boolean;
    _shards:      Shards;
    hits:         Hits;
    aggregations: Aggregations;
}

export interface Shards {
    total:      number;
    successful: number;
    skipped:    number;
    failed:     number;
}

export interface Aggregations {
    country: Country;
}

export interface Country {
    doc_count_error_upper_bound: number;
    sum_other_doc_count:         number;
    buckets:                     CountryBucket[];
}

export interface CountryBucket {
    key:       string;
    doc_count: number;
    histogram: Histogram;
}

export interface Histogram {
    buckets: HistogramBucket[];
}

export interface HistogramBucket {
    key_as_string: Date;
    key:           number;
    doc_count:     number;
    avg_price:     AvgPrice;
}

export interface AvgPrice {
    value: number;
}

export interface Hits {
    total:     Total;
    max_score: null;
    hits:      any[];
}

export interface Total {
    value:    number;
    relation: string;
}
