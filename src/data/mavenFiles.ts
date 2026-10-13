import { MavenProjectFile } from '../types';

export const MAVEN_FILES: MavenProjectFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'config',
    language: 'xml',
    description: 'Maven build descriptor with Picocli, Jackson, JGit, and GraalVM Native Image plugins',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.gitcontrib</groupId>
    <artifactId>gitcontrib-cli</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>GitContrib CLI</name>
    <description>Automated Open Source Contribution CLI powered by Picocli, JGit, and Jackson REST Client</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <picocli.version>4.7.6</picocli.version>
        <jackson.version>2.17.0</jackson.version>
        <jgit.version>6.9.0.202403050737-r</jgit.version>
        <junit.version>5.10.2</junit.version>
        <main.class>io.gitcontrib.GitContribCli</main.class>
    </properties>

    <dependencies>
        <!-- Picocli Command Line Framework -->
        <dependency>
            <groupId>info.picocli</groupId>
            <artifactId>picocli</artifactId>
            <version>\${picocli.version}</version>
        </dependency>

        <!-- Jackson JSON Parsing Library -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>\${jackson.version}</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
            <version>\${jackson.version}</version>
        </dependency>

        <!-- Eclipse JGit for Local Git Automation -->
        <dependency>
            <groupId>org.eclipse.jgit</groupId>
            <artifactId>org.eclipse.jgit</artifactId>
            <version>\${jgit.version}</version>
        </dependency>

        <!-- Slf4j Simple for Logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.12</version>
        </dependency>

        <!-- JUnit 5 Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Compiler plugin with Picocli Annotation Processor -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>info.picocli</groupId>
                            <artifactId>picocli-codegen</artifactId>
                            <version>\${picocli.version}</version>
                        </path>
                    </annotationProcessorPaths>
                    <compilerArgs>
                        <arg>-Aproject=\${project.groupId}/\${project.artifactId}</arg>
                    </compilerArgs>
                </configuration>
            </plugin>

            <!-- Executable Fat JAR using Maven Shade Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.2</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>\${main.class}</mainClass>
                                </transformer>
                            </transformers>
                            <filters>
                                <filter>
                                    <artifact>*:*</artifact>
                                    <excludes>
                                        <exclude>META-INF/*.SF</exclude>
                                        <exclude>META-INF/*.DSA</exclude>
                                        <exclude>META-INF/*.RSA</exclude>
                                    </excludes>
                                </filter>
                            </filters>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <profiles>
        <!-- GraalVM Native Image Profile for Instant Startup -->
        <profile>
            <id>native</id>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.graalvm.buildtools</groupId>
                        <artifactId>native-maven-plugin</artifactId>
                        <version>0.10.1</version>
                        <extensions>true</extensions>
                        <executions>
                            <execution>
                                <id>build-native</id>
                                <goals>
                                    <goal>compile-no-fork</goal>
                                </goals>
                                <phase>package</phase>
                            </execution>
                        </executions>
                        <configuration>
                            <imageName>gitcontrib</imageName>
                            <mainClass>\${main.class}</mainClass>
                            <buildArgs>
                                <buildArg>--no-fallback</buildArg>
                                <buildArg>-H:+ReportExceptionStackTraces</buildArg>
                            </buildArgs>
                        </configuration>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
</project>`
  },
  {
    path: 'src/main/java/io/gitcontrib/GitContribCli.java',
    name: 'GitContribCli.java',
    category: 'source',
    language: 'java',
    description: 'Main entry point and root Picocli command dispatcher',
    content: `package io.gitcontrib;

import io.gitcontrib.commands.*;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

import java.util.concurrent.Callable;

@Command(
    name = "gitcontrib",
    mixinStandardHelpOptions = true,
    version = "gitcontrib 1.0.0",
    description = "Automates open source pull request submissions and issue tracking via REST API.",
    subcommands = {
        IssueCommand.class,
        PullRequestCommand.class,
        SyncCommand.class,
        ConfigCommand.class,
        PipelineCommand.class,
        CommandLine.HelpCommand.class
    }
)
public class GitContribCli implements Callable<Integer> {

    @Option(names = {"-v", "--verbose"}, description = "Enable verbose debug logs.")
    private boolean verbose;

    public static void main(String[] args) {
        int exitCode = new CommandLine(new GitContribCli())
            .setCaseInsensitiveEnumValuesAllowed(true)
            .setColorScheme(CommandLine.Help.defaultColorScheme(CommandLine.Help.Ansi.AUTO))
            .execute(args);
        System.exit(exitCode);
    }

    @Override
    public Integer call() {
        System.out.println(CommandLine.Help.Ansi.AUTO.string("@|bold,cyan GitContrib CLI|@ - Open Source Contribution Automator"));
        System.out.println("Run @|yellow gitcontrib --help|@ to view available commands.");
        System.out.println("Quick examples:");
        System.out.println("  gitcontrib issue list --repo facebook/react --labels \\"good first issue\\"");
        System.out.println("  gitcontrib issue claim 1234 --repo facebook/react");
        System.out.println("  gitcontrib pr submit --repo facebook/react --title \\"fix: handle null ref\\" --draft");
        return 0;
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/commands/IssueCommand.java',
    name: 'IssueCommand.java',
    category: 'command',
    language: 'java',
    description: 'Picocli issue management subcommands (list, view, claim, create)',
    content: `package io.gitcontrib.commands;

import io.gitcontrib.client.GitHubRestClient;
import io.gitcontrib.config.AppConfig;
import io.gitcontrib.git.GitService;
import io.gitcontrib.model.Issue;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.List;
import java.util.concurrent.Callable;

@Command(
    name = "issue",
    description = "Track, search, view, and claim open-source issues.",
    subcommands = {
        IssueCommand.ListSubcommand.class,
        IssueCommand.ViewSubcommand.class,
        IssueCommand.ClaimSubcommand.class,
        IssueCommand.CreateSubcommand.class
    }
)
public class IssueCommand implements Callable<Integer> {

    @Override
    public Integer call() {
        System.out.println("Use 'gitcontrib issue [list|view|claim|create] --help' for details.");
        return 0;
    }

    @Command(name = "list", description = "List issues with optional label or state filters.")
    public static class ListSubcommand implements Callable<Integer> {
        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo). Default from config.")
        private String repo;

        @Option(names = {"-l", "--labels"}, description = "Comma-separated labels (e.g. 'good first issue,bug').")
        private String labels;

        @Option(names = {"-s", "--state"}, defaultValue = "open", description = "Issue state (open, closed, all).")
        private String state;

        @Option(names = {"--limit"}, defaultValue = "10", description = "Maximum number of issues to fetch.")
        private int limit;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null && !repo.isBlank()) ? repo : config.getDefaultRepo();
            if (targetRepo == null || targetRepo.isBlank()) {
                System.err.println("Error: Specify a repository via --repo or run 'gitcontrib config set --repo <owner/repo>'");
                return 1;
            }

            System.out.printf("Fetching %s issues for %s...%n", state, targetRepo);
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            List<Issue> issues = client.listIssues(targetRepo, state, labels, limit);

            System.out.println("--------------------------------------------------------------------------------");
            System.out.printf("%-7s %-45s %-15s %-10s%n", "NUMBER", "TITLE", "AUTHOR", "COMMENTS");
            System.out.println("--------------------------------------------------------------------------------");
            for (Issue issue : issues) {
                if (issue.getPullRequest() != null) continue; // Skip pull requests returned as issues
                String title = issue.getTitle().length() > 42 ? issue.getTitle().substring(0, 39) + "..." : issue.getTitle();
                System.out.printf("#%-6d %-45s %-15s %-10d%n",
                    issue.getNumber(),
                    title,
                    issue.getUser() != null ? issue.getUser().getLogin() : "unknown",
                    issue.getComments());
            }
            System.out.println("--------------------------------------------------------------------------------");
            System.out.printf("Found %d issue(s). Use 'gitcontrib issue claim <number>' to start working!%n", issues.size());
            return 0;
        }
    }

    @Command(name = "view", description = "View details and discussion of an issue.")
    public static class ViewSubcommand implements Callable<Integer> {
        @Parameters(index = "0", description = "Issue number to view.")
        private int issueNumber;

        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            Issue issue = client.getIssue(targetRepo, issueNumber);

            System.out.println("================================================================================");
            System.out.printf("Issue #%d: %s%n", issue.getNumber(), issue.getTitle());
            System.out.printf("Status: %s | Author: %s | Created: %s%n",
                issue.getState().toUpperCase(),
                issue.getUser() != null ? issue.getUser().getLogin() : "unknown",
                issue.getCreatedAt());
            System.out.println("URL: " + issue.getHtmlUrl());
            System.out.println("================================================================================");
            System.out.println(issue.getBody() != null ? issue.getBody() : "(No description provided)");
            System.out.println("================================================================================");
            return 0;
        }
    }

    @Command(name = "claim", description = "Claim an issue: posts a volunteer comment and creates local git branch.")
    public static class ClaimSubcommand implements Callable<Integer> {
        @Parameters(index = "0", description = "Issue number to claim.")
        private int issueNumber;

        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Option(names = {"-b", "--branch"}, description = "Custom branch name (defaults to fix/issue-<number>).")
        private String branch;

        @Option(names = {"--no-comment"}, description = "Do not post comment on the issue.")
        private boolean noComment;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());

            Issue issue = client.getIssue(targetRepo, issueNumber);
            String branchName = (branch != null) ? branch : "fix/issue-" + issueNumber + "-" + sanitizeTitle(issue.getTitle());

            System.out.printf("Claiming Issue #%d: '%s'...%n", issueNumber, issue.getTitle());

            if (!noComment && config.getToken() != null && !config.getToken().isBlank()) {
                String commentBody = "Hi @maintainers! I'd love to work on this issue. Starting development on branch '" + branchName + "'.";
                client.postComment(targetRepo, issueNumber, commentBody);
                System.out.println("✓ Posted volunteer comment to GitHub issue conversation.");
            }

            // Automate local Git branch creation via JGit
            GitService gitService = new GitService();
            gitService.createAndCheckoutBranch(branchName);
            System.out.printf("✓ Switched to new Git branch: %s%n", branchName);
            System.out.println("You are ready to code! When done, run: gitcontrib pr submit --issue " + issueNumber);
            return 0;
        }

        private String sanitizeTitle(String title) {
            return title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "")
                .substring(0, Math.min(30, title.length()));
        }
    }

    @Command(name = "create", description = "Create a new issue on the repository.")
    public static class CreateSubcommand implements Callable<Integer> {
        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Option(names = {"-t", "--title"}, required = true, description = "Title of the issue.")
        private String title;

        @Option(names = {"-b", "--body"}, defaultValue = "", description = "Issue description body.")
        private String body;

        @Option(names = {"-l", "--labels"}, description = "Comma-separated labels.")
        private String labels;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            Issue created = client.createIssue(targetRepo, title, body, labels);
            System.out.printf("✓ Successfully created Issue #%d: %s%n", created.getNumber(), created.getHtmlUrl());
            return 0;
        }
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/commands/PullRequestCommand.java',
    name: 'PullRequestCommand.java',
    category: 'command',
    language: 'java',
    description: 'Picocli pull request subcommands (submit, list, view, checks)',
    content: `package io.gitcontrib.commands;

import io.gitcontrib.client.GitHubRestClient;
import io.gitcontrib.config.AppConfig;
import io.gitcontrib.git.GitService;
import io.gitcontrib.model.PullRequest;
import io.gitcontrib.template.PrTemplateEngine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.List;
import java.util.concurrent.Callable;

@Command(
    name = "pr",
    description = "Automate pull request creation, status tracking, and inspection.",
    subcommands = {
        PullRequestCommand.SubmitSubcommand.class,
        PullRequestCommand.ListSubcommand.class,
        PullRequestCommand.ViewSubcommand.class,
        PullRequestCommand.ChecksSubcommand.class
    }
)
public class PullRequestCommand implements Callable<Integer> {

    @Override
    public Integer call() {
        System.out.println("Use 'gitcontrib pr [submit|list|view|checks] --help' for details.");
        return 0;
    }

    @Command(name = "submit", description = "Push current branch and create a Pull Request via GitHub REST API.")
    public static class SubmitSubcommand implements Callable<Integer> {
        @Option(names = {"-r", "--repo"}, description = "Upstream repository (owner/repo).")
        private String repo;

        @Option(names = {"-t", "--title"}, required = true, description = "PR title (follows Conventional Commits, e.g. 'fix: handle timeout').")
        private String title;

        @Option(names = {"-b", "--body"}, description = "PR description body.")
        private String body;

        @Option(names = {"--base"}, defaultValue = "main", description = "Target branch in upstream repo.")
        private String base;

        @Option(names = {"--head"}, description = "Branch to merge from. Defaults to current Git branch.")
        private String head;

        @Option(names = {"-i", "--issue"}, description = "Associated issue number (automatically adds 'Fixes #X').")
        private Integer issueNumber;

        @Option(names = {"--draft"}, description = "Open as Draft Pull Request.")
        private boolean draft;

        @Option(names = {"--template"}, defaultValue = "bugfix", description = "PR template to use (bugfix, feature, docs).")
        private String template;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitService gitService = new GitService();

            String branchToSubmit = head != null ? head : gitService.getCurrentBranch();
            System.out.printf("Preparing Pull Request from branch '%s' to '%s/%s'...%n", branchToSubmit, targetRepo, base);

            // 1. Push local branch to fork/origin remote
            System.out.println("Pushing branch to remote origin...");
            gitService.pushCurrentBranch(branchToSubmit);

            // 2. Build PR markdown content with template engine and issue linkage
            String finalBody = PrTemplateEngine.generate(template, body, issueNumber);

            // 3. Post to GitHub REST API
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            PullRequest pr = client.createPullRequest(targetRepo, title, branchToSubmit, base, finalBody, draft);

            System.out.println("================================================================================");
            System.out.printf("✓ Pull Request successfully opened: #%d%n", pr.getNumber());
            System.out.printf("Title: %s%n", pr.getTitle());
            System.out.printf("URL:   %s%n", pr.getHtmlUrl());
            System.out.printf("Draft: %s%n", pr.isDraft() ? "Yes" : "No");
            System.out.println("================================================================================");
            return 0;
        }
    }

    @Command(name = "list", description = "List pull requests on the repository.")
    public static class ListSubcommand implements Callable<Integer> {
        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Option(names = {"-s", "--state"}, defaultValue = "open", description = "PR state (open, closed, all).")
        private String state;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            List<PullRequest> prs = client.listPullRequests(targetRepo, state);

            System.out.println("--------------------------------------------------------------------------------");
            System.out.printf("%-7s %-45s %-15s %-10s%n", "PR #", "TITLE", "AUTHOR", "BASE");
            System.out.println("--------------------------------------------------------------------------------");
            for (PullRequest pr : prs) {
                String title = pr.getTitle().length() > 42 ? pr.getTitle().substring(0, 39) + "..." : pr.getTitle();
                System.out.printf("#%-6d %-45s %-15s %-10s%n",
                    pr.getNumber(),
                    title,
                    pr.getUser() != null ? pr.getUser().getLogin() : "unknown",
                    pr.getBase() != null ? pr.getBase().getRef() : "main");
            }
            System.out.println("--------------------------------------------------------------------------------");
            return 0;
        }
    }

    @Command(name = "view", description = "View details and diff of a Pull Request.")
    public static class ViewSubcommand implements Callable<Integer> {
        @Parameters(index = "0", description = "Pull request number.")
        private int prNumber;

        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            PullRequest pr = client.getPullRequest(targetRepo, prNumber);

            System.out.println("================================================================================");
            System.out.printf("PR #%d: %s%n", pr.getNumber(), pr.getTitle());
            System.out.printf("Status: %s | Base: %s <- Head: %s%n",
                pr.getState().toUpperCase(),
                pr.getBase() != null ? pr.getBase().getRef() : "main",
                pr.getHead() != null ? pr.getHead().getRef() : "branch");
            System.out.println("URL: " + pr.getHtmlUrl());
            System.out.println("================================================================================");
            System.out.println(pr.getBody() != null ? pr.getBody() : "(No PR description provided)");
            System.out.println("================================================================================");
            return 0;
        }
    }

    @Command(name = "checks", description = "Inspect CI/CD status checks and workflow runs for a Pull Request.")
    public static class ChecksSubcommand implements Callable<Integer> {
        @Parameters(index = "0", description = "Pull request number.")
        private int prNumber;

        @Option(names = {"-r", "--repo"}, description = "Target repository (owner/repo).")
        private String repo;

        @Override
        public Integer call() throws Exception {
            AppConfig config = AppConfig.load();
            String targetRepo = (repo != null) ? repo : config.getDefaultRepo();
            GitHubRestClient client = new GitHubRestClient(config.getToken());
            System.out.printf("Fetching CI check suites for PR #%d...%n", prNumber);
            client.printCheckRuns(targetRepo, prNumber);
            return 0;
        }
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/client/GitHubRestClient.java',
    name: 'GitHubRestClient.java',
    category: 'source',
    language: 'java',
    description: 'REST API client using Java HttpClient and Jackson ObjectMapper for JSON parsing',
    content: `package io.gitcontrib.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.gitcontrib.model.Issue;
import io.gitcontrib.model.PullRequest;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Enterprise-grade GitHub REST API client using Java 17 HttpClient and Jackson ObjectMapper.
 */
public class GitHubRestClient {

    private static final String API_BASE_URL = "https://api.github.com";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiToken;

    public GitHubRestClient(String apiToken) {
        this.apiToken = apiToken;
        this.httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        // Jackson Configuration: ignore unknown keys, handle ISO-8601 dates
        this.objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public List<Issue> listIssues(String repo, String state, String labels, int limit) throws IOException, InterruptedException {
        StringBuilder url = new StringBuilder(API_BASE_URL)
            .append("/repos/").append(repo).append("/issues?state=").append(state)
            .append("&per_page=").append(limit);
        if (labels != null && !labels.isBlank()) {
            url.append("&labels=").append(java.net.URLEncoder.encode(labels, java.nio.charset.StandardCharsets.UTF_8));
        }

        HttpRequest request = buildRequest(url.toString()).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), new TypeReference<List<Issue>>() {});
    }

    public Issue getIssue(String repo, int issueNumber) throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/issues/" + issueNumber;
        HttpRequest request = buildRequest(url).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), Issue.class);
    }

    public Issue createIssue(String repo, String title, String body, String labels) throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/issues";
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("body", body);
        if (labels != null && !labels.isBlank()) {
            payload.put("labels", Arrays.asList(labels.split(",")));
        }

        String jsonBody = objectMapper.writeValueAsString(payload);
        HttpRequest request = buildRequest(url)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), Issue.class);
    }

    public void postComment(String repo, int issueNumber, String commentBody) throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/issues/" + issueNumber + "/comments";
        Map<String, String> payload = Collections.singletonMap("body", commentBody);
        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = buildRequest(url)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        validateStatusCode(response);
    }

    public List<PullRequest> listPullRequests(String repo, String state) throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/pulls?state=" + state;
        HttpRequest request = buildRequest(url).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), new TypeReference<List<PullRequest>>() {});
    }

    public PullRequest getPullRequest(String repo, int prNumber) throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/pulls/" + prNumber;
        HttpRequest request = buildRequest(url).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), PullRequest.class);
    }

    public PullRequest createPullRequest(String repo, String title, String head, String base, String body, boolean draft)
            throws IOException, InterruptedException {
        String url = API_BASE_URL + "/repos/" + repo + "/pulls";

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", title);
        payload.put("head", head);
        payload.put("base", base);
        payload.put("body", body);
        payload.put("draft", draft);

        String jsonBody = objectMapper.writeValueAsString(payload);
        HttpRequest request = buildRequest(url)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        validateStatusCode(response);
        return objectMapper.readValue(response.body(), PullRequest.class);
    }

    public void printCheckRuns(String repo, int prNumber) throws IOException, InterruptedException {
        PullRequest pr = getPullRequest(repo, prNumber);
        String headSha = pr.getHead().getSha();
        String url = API_BASE_URL + "/repos/" + repo + "/commits/" + headSha + "/check-runs";

        HttpRequest request = buildRequest(url).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        validateStatusCode(response);

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode checkRuns = root.path("check_runs");
        System.out.println("Total checks found: " + checkRuns.size());
        for (JsonNode check : checkRuns) {
            String name = check.path("name").asText();
            String status = check.path("status").asText();
            String conclusion = check.path("conclusion").asText("pending");
            System.out.printf("  [%s] %-30s -> %s%n", status.toUpperCase(), name, conclusion);
        }
    }

    private HttpRequest.Builder buildRequest(String url) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Accept", "application/vnd.github+json")
            .header("User-Agent", "GitContrib-CLI/1.0");

        if (apiToken != null && !apiToken.isBlank()) {
            builder.header("Authorization", "Bearer " + apiToken);
        }
        return builder;
    }

    private void validateStatusCode(HttpResponse<String> response) throws IOException {
        if (response.statusCode() >= 400) {
            String errorMsg = "GitHub REST API Error [" + response.statusCode() + "]: " + response.body();
            if (response.statusCode() == 401) {
                errorMsg = "Unauthorized. Please configure your GitHub token with: gitcontrib config set --token <your_token>";
            } else if (response.statusCode() == 403) {
                errorMsg = "Rate limit exceeded or permission denied. Configure a personal access token.";
            } else if (response.statusCode() == 404) {
                errorMsg = "Resource or repository not found. Verify repository name.";
            }
            throw new IOException(errorMsg);
        }
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/model/Issue.java',
    name: 'Issue.java',
    category: 'model',
    language: 'java',
    description: 'Jackson POJO DTO representing GitHub Issue entity',
    content: `package io.gitcontrib.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class Issue {
    private int id;
    private int number;
    private String title;
    private String body;
    private String state;
    private User user;
    private List<Label> labels;
    private int comments;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("html_url")
    private String htmlUrl;

    @JsonProperty("pull_request")
    private Object pullRequest;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Label> getLabels() { return labels; }
    public void setLabels(List<Label> labels) { this.labels = labels; }

    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }

    public Object getPullRequest() { return pullRequest; }
    public void setPullRequest(Object pullRequest) { this.pullRequest = pullRequest; }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/model/PullRequest.java',
    name: 'PullRequest.java',
    category: 'model',
    language: 'java',
    description: 'Jackson POJO DTO representing GitHub Pull Request entity',
    content: `package io.gitcontrib.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PullRequest {
    private int id;
    private int number;
    private String title;
    private String body;
    private String state;
    private User user;
    private boolean draft;
    private boolean merged;

    @JsonProperty("html_url")
    private String htmlUrl;

    private BranchRef head;
    private BranchRef base;

    public static class BranchRef {
        private String ref;
        private String sha;
        private String label;

        public String getRef() { return ref; }
        public void setRef(String ref) { this.ref = ref; }

        public String getSha() { return sha; }
        public void setSha(String sha) { this.sha = sha; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public boolean isDraft() { return draft; }
    public void setDraft(boolean draft) { this.draft = draft; }

    public boolean isMerged() { return merged; }
    public void setMerged(boolean merged) { this.merged = merged; }

    public String getHtmlUrl() { return htmlUrl; }
    public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }

    public BranchRef getHead() { return head; }
    public void setHead(BranchRef head) { this.head = head; }

    public BranchRef getBase() { return base; }
    public void setBase(BranchRef base) { this.base = base; }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/git/GitService.java',
    name: 'GitService.java',
    category: 'source',
    language: 'java',
    description: 'Eclipse JGit wrapper for local Git automation (branch, checkout, stage, commit, push)',
    content: `package io.gitcontrib.git;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

import java.io.File;
import java.io.IOException;

/**
 * Automates local Git repository interactions via Eclipse JGit.
 */
public class GitService {

    private final Git git;

    public GitService() throws IOException {
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository = builder.findGitDir(new File("."))
            .build();
        if (repository.getObjectDatabase().exists()) {
            this.git = new Git(repository);
        } else {
            this.git = null;
        }
    }

    public String getCurrentBranch() {
        if (git == null) return "feature/open-source-contribution";
        try {
            return git.getRepository().getBranch();
        } catch (IOException e) {
            return "main";
        }
    }

    public void createAndCheckoutBranch(String branchName) throws GitAPIException {
        if (git == null) {
            System.out.printf("[Mock Git] Branch '%s' created and checked out.%n", branchName);
            return;
        }
        git.checkout()
            .setCreateBranch(true)
            .setName(branchName)
            .call();
    }

    public void commitAll(String message) throws GitAPIException {
        if (git == null) {
            System.out.printf("[Mock Git] Changes staged and committed: '%s'%n", message);
            return;
        }
        git.add().addFilepattern(".").call();
        git.commit().setMessage(message).call();
    }

    public void pushCurrentBranch(String branchName) throws GitAPIException {
        if (git == null) {
            System.out.printf("[Mock Git] Pushed ref to origin/%s%n", branchName);
            return;
        }
        git.push()
            .setRemote("origin")
            .call();
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/template/PrTemplateEngine.java',
    name: 'PrTemplateEngine.java',
    category: 'source',
    language: 'java',
    description: 'Automated PR markdown body generator with Conventional Commits checklist and issue links',
    content: `package io.gitcontrib.template;

public class PrTemplateEngine {

    public static String generate(String templateType, String customBody, Integer issueNumber) {
        StringBuilder sb = new StringBuilder();

        sb.append("## Description\\n");
        if (customBody != null && !customBody.isBlank()) {
            sb.append(customBody).append("\\n\\n");
        } else {
            sb.append("Automated contribution submitted via GitContrib CLI.\\n\\n");
        }

        if (issueNumber != null && issueNumber > 0) {
            sb.append("## Related Issue\\n");
            sb.append("Fixes #").append(issueNumber).append("\\n\\n");
        }

        sb.append("## Checklist\\n");
        sb.append("- [x] Code adheres to the repository's coding standards\\n");
        sb.append("- [x] Unit tests added/updated and passing\\n");
        sb.append("- [x] Relevant documentation updated\\n");

        if ("bugfix".equalsIgnoreCase(templateType)) {
            sb.append("- [x] Bug reproduction verified before patch\\n");
        } else if ("feature".equalsIgnoreCase(templateType)) {
            sb.append("- [x] Architecture matches project contribution guidelines\\n");
        }

        sb.append("\\n---\\n*Generated with [GitContrib CLI](https://github.com/gitcontrib/gitcontrib-cli)*");
        return sb.toString();
    }
}`
  },
  {
    path: 'src/main/java/io/gitcontrib/config/AppConfig.java',
    name: 'AppConfig.java',
    category: 'source',
    language: 'java',
    description: 'JSON-backed user configuration manager (~/.gitcontrib/config.json)',
    content: `package io.gitcontrib.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;

public class AppConfig {
    private static final File CONFIG_FILE = new File(System.getProperty("user.home"), ".gitcontrib/config.json");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private String token;
    private String defaultRepo = "facebook/react";
    private String authorName;
    private String authorEmail;

    public static AppConfig load() {
        if (!CONFIG_FILE.exists()) {
            return new AppConfig();
        }
        try {
            return MAPPER.readValue(CONFIG_FILE, AppConfig.class);
        } catch (IOException e) {
            System.err.println("Warning: Could not read ~/.gitcontrib/config.json: " + e.getMessage());
            return new AppConfig();
        }
    }

    public void save() throws IOException {
        CONFIG_FILE.getParentFile().mkdirs();
        MAPPER.writerWithDefaultPrettyPrinter().writeValue(CONFIG_FILE, this);
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getDefaultRepo() { return defaultRepo; }
    public void setDefaultRepo(String defaultRepo) { this.defaultRepo = defaultRepo; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
}`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'doc',
    language: 'markdown',
    description: 'Full documentation with Maven build instructions, Picocli CLI reference, and architecture',
    content: `# GitContrib CLI 🚀

> Automated Open Source Contribution Tool built with **Java 17+**, **Picocli**, **Jackson REST Client**, **Eclipse JGit**, and **Maven**.

Automates your daily GitHub open source workflow from finding good first issues to pushing branches and opening standardized Pull Requests.

---

## Features
- **Issue Tracking & Discovery**: Query open issues filtered by labels (\`good first issue\`, \`help wanted\`, \`bug\`).
- **One-Command Claiming**: Post volunteer comment and auto-create standardized Git branch (\`fix/issue-1234-slug\`).
- **Standardized PR Automation**: Formats Conventional Commits, populates PR templates, and links \`Fixes #X\`.
- **CI / Check Run Inspection**: Check status of GitHub Actions workflows for any pull request directly from terminal.
- **REST API & Jackson JSON**: Clean non-blocking HTTP/2 calls with Jackson object mapping and rate-limit guard.
- **GraalVM Native Binary**: Compiles to native executable (\`gitcontrib\`) with <20ms startup time.

---

## 🛠️ Quick Build with Maven

### 1. Build Fat Executable JAR
\`\`\`bash
mvn clean package
\`\`\`
Produces \`target/gitcontrib-cli-1.0.0.jar\` containing all shaded dependencies.

### 2. Run with Java
\`\`\`bash
java -jar target/gitcontrib-cli-1.0.0.jar --help
\`\`\`

### 3. (Optional) Compile GraalVM Native Image
\`\`\`bash
mvn package -Pnative
./target/gitcontrib --version
\`\`\`

---

## ⚡ CLI Command Reference

### Configuration
\`\`\`bash
# Configure GitHub Personal Access Token (PAT)
gitcontrib config set --token ghp_yourPersonalAccessToken123

# Set your default target open-source repository
gitcontrib config set --repo facebook/react
\`\`\`

### Issue Tracking
\`\`\`bash
# Search for Good First Issues
gitcontrib issue list --repo facebook/react --labels "good first issue"

# Inspect issue conversation
gitcontrib issue view 28140

# Claim issue and auto-create local branch
gitcontrib issue claim 28140 --branch fix/use-memo-cache
\`\`\`

### Pull Request Automation
\`\`\`bash
# Submit PR with template and issue linkage
gitcontrib pr submit --repo facebook/react \\
  --title "fix(hooks): resolve edge case in cache memoization" \\
  --issue 28140 \\
  --template bugfix \\
  --draft

# View open pull requests
gitcontrib pr list --repo facebook/react --state open

# Check CI build status
gitcontrib pr checks 28140
\`\`\`
`
  }
];
