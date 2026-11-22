# University Source Coverage — Phase 13A

Snapshot: 2026-11-15. The audit used the configured fixed listing URLs, checked robots.txt first, obeyed denials/unreadable policies, applied request limits, and did not follow redirects or fetch detail pages. `LIVE VERIFIED` means the bounded listing request was permitted and parsed; it does not certify the parser's recall. All configured parsers returned **0 competition candidates** in this snapshot. Research-only sources have no production parser.

| Source | Fixed listing URL | Snapshot result | Parser matches |
|---|---|---|---:|
| UIU | https://www.uiu.ac.bd/event/ | Unreachable (URLError) | 0 |
| BUET CSE | https://cse.buet.ac.bd/; /home/all_event | robots.txt HTTP 404; listing not requested | 0 |
| NSU ECE | https://ece.northsouth.edu/event/ | Live verified | 0 |
| DIU | https://news.daffodilvarsity.edu.bd/category-news/events | Live verified | 0 |
| RUET | https://ruet.ac.bd/news-and-event | Empty/unreadable robots response; listing not requested | 0 |
| Khulna University | https://ku.ac.bd/notices | Live verified | 0 |
| GSTU | https://gstu.edu.bd/dev/notice/ | Live verified | 0 |
| University of Dhaka | https://www.du.ac.bd/events; / | Live verified | 0 |
| AIUB | https://www.aiub.edu/category/notices; / | robots.txt HTTP 404; listing not requested | 0 |
| IUT | https://www.iutoic-dhaka.edu/ | Live verified | 0 |
| Jagannath University | https://jnu.ac.bd/newsite/noticeview/1 | Live verified | 0 |
| Jahangirnagar IIT | https://iitju.edu.bd/news-events | robots.txt HTTP 404; listing not requested | 0 |
| UAP CSE | https://cse.uap-bd.edu/office/posts/?type=notice | Live verified | 0 |
| University of Rajshahi | https://www.ru.ac.bd/ | Live verified | 0 |
| KUET | https://www.kuet.ac.bd/ | Unreachable (URLError) | 0 |

## Additional official source research

These fixed targets were readable under the audit policy but are research-only; none has an executable production connector/parser yet.

| Institution | Official target | Result |
|---|---|---|
| AUST | https://www.aust.edu/cse/news | Readable; research only |
| BRAC University | https://www.bracu.ac.bd/news-archive | Readable; research only |
| DUET | https://www.duet.ac.bd/department/cse/galleries | Readable; research only |
| IUB | https://iub.ac.bd/news-and-events/latest-news | Readable; research only |
| BUP | https://bup.edu.bd/public/club-home/bup-computer-programming-club | Empty/unreadable robots response; listing not requested |
| CUET | https://cuet.ac.bd/news-events | robots.txt HTTP 402; listing not requested |
| EWU | https://www.ewubd.edu/events | robots.txt HTTP 404; listing not requested |
| SUST | https://www.sust.edu/public/145/news-and-events/49 | robots.txt HTTP 403; listing not requested |

## Scope and next steps

No robots denial or access failure was bypassed. HTTP 404/402 policy endpoints are treated as unresolved and therefore no listing fetch was made. Continue targeted parser review against permitted listings and maintain false-positive/false-negative fixtures. Recheck inaccessible sources only through an official endpoint or documented permission/contact route. Do not enable a source merely because its homepage responds; terms, stable announcement structure, and parser quality still need review. Detailed request hashes/statuses are in `backend/.runtime/phase13a/live/results.json`.

## Exact verification outcome

The app database contains 19 configured sources (15 university connectors), 18 enabled sources and one disabled Facebook source. Its last persisted runs are dated 2026-11-06. The 2026-11-15 read-only network audit permitted 9 of the 15 configured university listings; all 9 yielded zero parser matches. The remaining 6 had three robots HTTP 404 responses, one unreadable robots response, and two transport failures. This live audit did not import candidates. See the main report for existing database candidate/publication totals, which are not attributable to the live audit.
