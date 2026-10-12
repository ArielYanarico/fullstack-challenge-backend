import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get('NODE_ENV') === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
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
