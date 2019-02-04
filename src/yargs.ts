/*********************************************************************
* Copyright (c) 2018 Red Hat, Inc.
*
* This program and the accompanying materials are made
* available under the terms of the Eclipse Public License 2.0
* which is available at https://www.eclipse.org/legal/epl-2.0/
*
* SPDX-License-Identifier: EPL-2.0
**********************************************************************/

import * as yargs from 'yargs';
import { Logger } from './logger';
import * as path from 'path';
import { CliError } from './cli-error';
import { Production } from './production';
import { Init } from './init';
import { Cdn } from './cdn';
import { Extensions } from './extensions';
import { Clean } from './clean';

const ASSSEMBLY_PATH = 'examples/assembly';

/**
 * Entry point of this helper script
 * @author Florent Benoit
 */
const commandArgs = yargs
    .usage('$0 <cmd> [args]')
    .command({
        command: 'init',
        describe: 'Initialize current theia to beahve like a Che/Theia',
        builder: Extensions.argBuilder,
        handler: async (args) => {
            try {
                const assemblyFolder = path.resolve(process.cwd(), ASSSEMBLY_PATH);
                const packagesFolder = path.resolve(process.cwd(), 'packages');
                const cheFolder = path.resolve(process.cwd(), 'che');
                const init = new Init(process.cwd(), assemblyFolder, cheFolder);
                const version = await init.getCurrentVersion();
                await init.generate();
                const extensions = new Extensions(process.cwd(), packagesFolder, cheFolder, assemblyFolder, version);
                await extensions.readConfigurationAndGenerate(args.config, args.dev);
            } catch (err) {
                handleError(err);
            }
        },
    })
    .command({
        command: 'production',
        describe: 'Copy Theia to a production directory',
        handler: async () => {
            try {
                const assemblyFolder = path.resolve(process.cwd(), ASSSEMBLY_PATH);
                const production = new Production(process.cwd(), assemblyFolder, 'production');
                await production.create();
            } catch (err) {
                handleError(err);
            }
        },
    })
    .command({
        command: 'cdn',
        describe: 'Add or update the CDN support configuration',
        builder: Cdn.argBuilder,
        handler: async (argv) => {
            try {
                const assemblyFolder = path.resolve(process.cwd(), ASSSEMBLY_PATH);
                const cdn = new Cdn(assemblyFolder, argv.theia, argv.monaco);
                await cdn.create();
            } catch (err) {
                handleError(err);
            }
        },
    })
    .command({
        command: 'clean',
        describe: 'Clean Theia repository',
        handler: async () => {
            try {
                const assemblyFolder = path.resolve(process.cwd(), ASSSEMBLY_PATH);
                const packagesFolder = path.resolve(process.cwd(), 'packages');
                const cheFolder = path.resolve(process.cwd(), 'che');
                const nodeModules = path.resolve(process.cwd(), 'node_modules');
                const clean = new Clean(assemblyFolder, cheFolder, packagesFolder, nodeModules);
                await clean.cleanCheTheia();
            } catch (err) {
                handleError(err);
            }
        }
    })
    .help()
    .strict()
    .demandCommand()
    .argv;

if (!commandArgs) {
    yargs.showHelp();
}

function handleError(error: any): void {
    if (error instanceof CliError) {
        Logger.error('=> 🚒 ' + error.message);
    } else {
        Logger.error(error);
    }
    process.exit(1);
}
