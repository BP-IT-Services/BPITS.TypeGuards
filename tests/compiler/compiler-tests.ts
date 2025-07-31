import { spawnSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

interface TestResult {
    file: string;
    passed: boolean;
    expectedErrors: string[];
    actualOutput: string;
}

class CompilerTester {
    private readonly _debugMode = false;

    private readonly testDir = __dirname;
    private readonly baseTsConfigPath = join(process.cwd(), 'tsconfig.test-compiler.json');

    runTests(): void {
        console.log('🔍 Running TypeScript compiler tests...\n');
        console.log(`Current working directory: ${process.cwd()}`);
        console.log(`Test directory: ${this.testDir}`);
        console.log(`Base tsconfig: ${this.baseTsConfigPath}`);
        console.log(`Valid directory: ${join(this.testDir, 'valid')}`);
        console.log(`Invalid directory: ${join(this.testDir, 'invalid')}`);

        // Verify base tsconfig exists
        if (!existsSync(this.baseTsConfigPath)) {
            console.error(`❌ Base tsconfig not found at: ${this.baseTsConfigPath}`);
            process.exit(1);
        }

        const validTests = this.runValidTests();
        const invalidTests = this.runInvalidTests();

        this.printResults([ ...validTests, ...invalidTests ]);
    }

    private runValidTests(): TestResult[] {
        const validDir = join(this.testDir, 'valid');
        const files = this.getTestFiles(validDir);

        console.log(`\nFound ${files.length} test files`, files);
        console.log('✅  Testing files that should compile without errors:');

        return files.map(file => {
            const filePath = join(validDir, file);
            const result = this.compileFileWithConfig(filePath);

            const passed = result.exitCode === 0;
            console.log(`  ${passed ? '✅' : '❌'}  ${file}`);

            if (!passed) {
                console.log(`    Unexpected errors: ${result.output}`);
            }

            return {
                file: `valid/${file}`,
                passed,
                expectedErrors: [],
                actualOutput: result.output
            };
        });
    }

    private runInvalidTests(): TestResult[] {
        const invalidDir = join(this.testDir, 'invalid');
        const files = this.getTestFiles(invalidDir);

        console.log(`\nFound ${files.length} test files`, files);
        console.log('❌  Testing files that should have compiler errors:');

        return files.map(file => {
            const filePath = join(invalidDir, file);
            const expectedErrors = this.extractExpectedErrors(filePath);
            const result = this.compileFileWithConfig(filePath);

            const hasExpectedErrors = expectedErrors.every(error =>
                result.output.includes(error)
            );
            const passed = result.exitCode !== 0 && hasExpectedErrors;

            console.log(`  ${passed ? '✅' : '❌'}  ${file}`);

            if (!passed) {
                if (result.exitCode === 0) {
                    console.log(`    Expected compilation to fail, but it succeeded`);
                } else if (!hasExpectedErrors) {
                    console.log(`    Missing expected errors:`);
                    expectedErrors.forEach(error => {
                        if (!result.output.includes(error)) {
                            console.log(`      - ${error}`);
                        }
                    });
                }
            }

            return {
                file: `invalid/${file}`,
                passed,
                expectedErrors,
                actualOutput: result.output
            };
        });
    }

    private getTestFiles(dir: string): string[] {
        try {
            return readdirSync(dir)
                .filter(file => file.endsWith('.ts'))
                .sort();
        } catch (error) {
            console.log(`Could not read directory ${dir}:`, error);
            return [];
        }
    }

    private extractExpectedErrors(filePath: string): string[] {
        const content = readFileSync(filePath, 'utf-8');
        const errorComments = content.match(/\/\/ @expect-error: (.+)/g) || [];

        return errorComments.map(comment =>
            comment.replace('// @expect-error: ', '').trim()
        );
    }

    private generateTsConfigForFile(filePath: string): string {
        // Read the base tsconfig
        const baseTsConfig = JSON.parse(readFileSync(this.baseTsConfigPath, 'utf-8'));

        // Create a new tsconfig that includes the specific test file
        const testTsConfig = {
            ...baseTsConfig,
            // Use absolute path for extends to avoid path resolution issues
            extends: this.baseTsConfigPath.endsWith('tsconfig.test-compiler.json')
                ? './tsconfig.json'  // If using tsconfig.test-compiler.json, extend the main tsconfig.json
                : baseTsConfig.extends,
            include: [

                relative(process.cwd(), filePath), // Include the specific test file (relative to project root)
                ...(baseTsConfig.include || [])    // Include source files from base config
            ]
        };

        // Generate a unique temp tsconfig name based on the test file
        const testFileName = relative(this.testDir, filePath).replace(/[/\\]/g, '_').replace('.ts', '');
        const tempTsConfigPath = join(process.cwd(), `tsconfig.temp.${testFileName}.json`);

        // Write the temporary tsconfig
        writeFileSync(tempTsConfigPath, JSON.stringify(testTsConfig, null, 2));

        return tempTsConfigPath;
    }

    private compileFileWithConfig(filePath: string): { exitCode: number; output: string } {
        let tempTsConfigPath: string | null = null;

        try {
            // Generate temporary tsconfig for this specific file
            tempTsConfigPath = this.generateTsConfigForFile(filePath);

            if (this._debugMode) {
                console.log(`    Executing command: tsc --project ${tempTsConfigPath}`);
                console.log(`    Temp tsconfig contents:`, readFileSync(tempTsConfigPath, 'utf-8'));
            }

            const result = spawnSync('tsc', [ '--project', `"${tempTsConfigPath}"` ], {
                encoding: 'utf-8',
                cwd: process.cwd(),
                shell: true
            });

            const output = (result.stdout || '') + (result.stderr || '');
            const exitCode = result.status ?? 0;
            if (this._debugMode) {
                console.log(`    Raw result:`, {
                    status: result.status,
                    signal: result.signal,
                    error: result.error,
                    stdout: result.stdout,
                    stderr: result.stderr
                });

                console.log(`    Final exit code: ${exitCode}`);
                if (output.trim()) {
                    console.log(`    Output: ${output.trim()}`);
                }
            }

            return {
                exitCode,
                output: output.trim()
            };
        } catch (error: any) {
            console.log(`    Exception during compilation: ${error.message}`);
            return {
                exitCode: 1,
                output: error.message || 'Unknown error occurred'
            };
        } finally {
            if (!this._debugMode && tempTsConfigPath && existsSync(tempTsConfigPath)) {
                try {
                    unlinkSync(tempTsConfigPath);
                } catch (cleanupError) {
                    console.warn(`Warning: Could not clean up temp file ${tempTsConfigPath}`);
                }
            } else if (this._debugMode) {
                console.log(`    Temp file left for debugging: ${tempTsConfigPath}`);
            }
        }
    }

    private printResults(results: TestResult[]): void {
        const passed = results.filter(r => r.passed).length;
        const total = results.length;

        console.log(`\n📊 Results: ${passed}/${total} tests passed`);

        if (passed === total) {
            console.log('🎉 All compiler tests passed!');
            process.exit(0);
        } else {
            console.log('💥 Some tests failed');
            process.exit(1);
        }
    }
}

// Run the tests
new CompilerTester().runTests();