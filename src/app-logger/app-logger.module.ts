import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';
        const level = config.get<string>('LOGGING_LEVEL');
        return {
          pinoHttp: {
            level,
            transport: {
              targets: [
                {
                  target: 'pino-pretty',
                  options: {
                    colorize: isDev,
                    singleLine: true
                  },
                },
                {
                  target: 'pino-roll',
                  options: {
                    file: `./logs/${isDev ? 'local' : 'prod'}.log`,
                    mkdir: true,
                    size: '20m',
                    interval: '1d',
                    keep: '10',
                  }
                }
              ]
            },
            serializers: {
              req: (req) => ({
                method: req.method,
                url: req.url,
                requestId: req.id,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };
      },
    }),
  ],
})

export class AppLoggerModule { }
