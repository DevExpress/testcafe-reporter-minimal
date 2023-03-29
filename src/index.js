const NEW_LINE = '\n ';

export default function () {
    return {
        noColors:           false,
        spaceLeft:          0,
        errDescriptors:     [],
        currentFixtureName: null,
        testCount:          0,
        skipped:            0,

        reportTaskStart (startTime, userAgents, testCount) {
            this.testCount = testCount;

            const writeData = { startTime, userAgents, testCount };

            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.bold('Running tests in:'), writeData)
                .newline();

            userAgents.forEach(ua => {
                this.write(`- ${this.chalk.blue(ua)}`, writeData)
                    .newline();
            });
        },

        reportFixtureStart (name) {
            this.currentFixtureName = name;
        },

        reportTestDone (name, testRunInfo, meta) {
            const hasErr = !!testRunInfo.errs.length;
            let symbol   = null;

            if (testRunInfo.skipped) {
                this.skipped++;

                symbol = this.chalk.cyan('-');
            }
            else if (hasErr)
                symbol = this.chalk.red('!');
            else
                symbol = '.';

            const writeData = { name, testRunInfo, meta };

            if (this.spaceLeft - 1 < 0) {
                this.spaceLeft = this.viewportWidth - NEW_LINE.length - 1;
                this.write(NEW_LINE, writeData);
            }
            else
                this.spaceLeft--;

            this.write(symbol, writeData);

            if (hasErr) {
                this.errDescriptors = this.errDescriptors.concat(testRunInfo.errs.map(err => {
                    return {
                        err:         err,
                        testName:    name,
                        fixtureName: this.currentFixtureName
                    };
                }));
            }
        },

        _renderErrors (writeData) {
            this.newline();

            this.errDescriptors.forEach((errDescriptor) => {
                const title = `${this.chalk.bold.red(this.symbols.err)} ${errDescriptor.fixtureName} - ${errDescriptor.testName}`;

                this.setIndent(1)
                    .useWordWrap(true)
                    .newline()
                    .write(title, writeData)
                    .newline()
                    .newline()
                    .setIndent(3)
                    .write(this.formatError(errDescriptor.err), writeData)
                    .newline()
                    .newline();
            });
        },

        _renderWarnings (warnings, writeData) {
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`), writeData)
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow('--'), writeData)
                    .newline()
                    .setIndent(2)
                    .write(msg, writeData)
                    .newline();
            });
        },

        reportTaskDone (endTime, passed, warnings, result) {
            const allPassed = !this.errDescriptors.length;
            const footer    = allPassed ?
                this.chalk.bold.green(`${this.testCount} passed`) :
                this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            const writeData = { endTime, passed, warnings, result };

            if (!allPassed)
                this._renderErrors(writeData);
            else
                this.newline();

            this.setIndent(1)
                .newline()
                .write(footer, writeData)
                .newline();

            if (this.skipped > 0) {
                this.write(this.chalk.cyan(`${this.skipped} skipped`), writeData)
                    .newline();
            }

            if (warnings.length)
                this._renderWarnings(warnings, writeData);
        }
    };
}
