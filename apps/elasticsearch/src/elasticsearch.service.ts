import { HttpStatus, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RpcException } from '@nestjs/microservices';
import * as moment from 'moment';

interface ServiceTypeBuckets {
  key: string;
  doc_count: number;
}

interface ServiceTypeAggregations {
  service_types: {
    buckets: ServiceTypeBuckets[];
  };
}

@Injectable()
export class SearchService {
  private readonly index = 'famfund-app-production';
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  private serviceType = [
    'auth',
    'user',
    'payment',
    'family',
    'invitation',
    'chat',
    'notification',
    'crawler',
    'calendar',
    'checklist',
    'guideline',
    'education',
    'subject',
    'household',
    'room',
    'finance',
    'utilities',
    'shopping',
  ];

  async getLogsCount() {
    try {
      const totalPromise = this.elasticsearchService.count({
        index: this.index,
        body: {
          query: {
            match_all: {},
          },
        },
      });

      const infoPromise = this.elasticsearchService.count({
        index: this.index,
        body: {
          query: {
            match: { 'log.level': 'info' },
          },
        },
      });

      const errorPromise = this.elasticsearchService.count({
        index: this.index,
        body: {
          query: {
            match: { 'log.level': 'error' },
          },
        },
      });

      const [response, logInfoResponse, logErrorResponse] = await Promise.all([
        totalPromise,
        infoPromise,
        errorPromise,
      ]);

      return {
        total: response.count,
        info: logInfoResponse.count,
        error: logErrorResponse.count,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getLogs(dto: any) {
    try {
      const {
        logLevel,
        ip,
        url,
        method,
        message,
        page,
        itemsPerPage,
        sortBy,
        sortDirection,
        statusCode,
      } = dto;

      const query: any = {
        bool: {
          must: [],
        },
      };
      if (logLevel) {
        query.bool.must.push({ match: { 'log.level': logLevel } });
      }
      if (ip) {
        query.bool.must.push({ match_phrase_prefix: { ip: ip } });
      }
      if (url) {
        query.bool.must.push({ match_phrase_prefix: { url: url } });
      }
      if (method) {
        query.bool.must.push({ match: { method: method } });
      }
      if (message) {
        query.bool.must.push({ match_phrase_prefix: { message: message } });
      }
      if (statusCode) {
        query.bool.must.push({ match: { statusCode: statusCode } });
      }

      const sort = [{ [sortBy]: { order: sortDirection } }];

      const result = await this.elasticsearchService.search({
        index: 'famfund-app-production',
        from: (page - 1) * itemsPerPage,
        size: itemsPerPage,
        query,
        sort,
      });

      const logs = result.hits.hits.map((hit) => hit._source);
      const total = result.hits.total;

      return {
        logs,
        total,
        page,
        itemsPerPage,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getLogsCountByTimeRange(
    dto: any,
  ): Promise<{ time: string; count: number }[]> {
    try {
      const { timeStart, timeEnd } = dto;
      const timeDifference = moment(timeEnd).diff(moment(timeStart), 'minutes');
      const intervalMinutes = Math.round(timeDifference / 30);

      const intervals = Array.from(Array(30).keys()).map((index) => {
        const startTime = moment(timeStart)
          .add(index * intervalMinutes, 'minutes')
          .toISOString();
        const endTime = moment(startTime)
          .add(intervalMinutes, 'minutes')
          .toISOString();

        return { startTime, endTime };
      });

      const counts = await Promise.all(
        intervals.map(async ({ startTime, endTime }) => {
          const result = await this.elasticsearchService.count({
            index: 'famfund-app-production',
            body: {
              query: {
                range: {
                  '@timestamp': {
                    gte: startTime,
                    lt: endTime,
                  },
                },
              },
            },
          });
          return {
            time: moment(startTime).format('YYYY-MM-DD HH:mm'),
            count: result.count,
          };
        }),
      );
      return counts;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getServiceLogsTypeByTimeRange(dto: any) {
    try {
      const { timeStart, timeEnd } = dto;
      const timeDifference = moment(timeEnd).diff(moment(timeStart), 'minutes');
      const intervalMinutes = Math.round(timeDifference / 30);

      const numberOfIntervals = Math.min(
        Math.ceil(timeDifference / intervalMinutes),
        30,
      );

      const intervals = Array.from(Array(numberOfIntervals).keys()).map(
        (index) => {
          const startTime = moment(timeStart)
            .add(index * intervalMinutes, 'minutes')
            .toISOString();
          const endTime = moment(startTime)
            .add(intervalMinutes, 'minutes')
            .toISOString();

          return { startTime, endTime };
        },
      );

      const results = await Promise.all(
        intervals.map(async ({ startTime, endTime }) => {
          try {
            const result = await this.elasticsearchService.search({
              index: 'famfund-app-production',
              body: {
                query: {
                  bool: {
                    filter: [
                      {
                        range: {
                          '@timestamp': {
                            gte: startTime,
                            lt: endTime,
                          },
                        },
                      },
                    ],
                  },
                },
                aggs: {
                  service_types: {
                    terms: {
                      field: 'service.type',
                      size: 20,
                    },
                  },
                },
              },
            });

            const aggregations =
              result.aggregations as unknown as ServiceTypeAggregations;

            return {
              time: moment(startTime).format('YYYY-MM-DD HH:mm'),
              counts: aggregations.service_types.buckets.map((bucket) => ({
                type: bucket.key,
                count: bucket.doc_count,
              })),
            };
          } catch (searchError) {
            console.error('Error fetching aggregation data:', searchError);
            throw new RpcException({
              message: searchError.message,
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
          }
        }),
      );

      return results.flat();
    } catch (error) {
      throw new RpcException({
        message: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
