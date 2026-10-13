import JSZip from 'jszip';
import { MAVEN_FILES } from '../data/mavenFiles';

export async function downloadMavenProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root directory inside zip
  const projectFolder = zip.folder('gitcontrib-cli');
  if (!projectFolder) return;

  // Add all code files
  for (const file of MAVEN_FILES) {
    projectFolder.file(file.path, file.content);
  }

  // Add .gitignore
  projectFolder.file(
    '.gitignore',
    `target/
!.mvn/wrapper/maven-wrapper.jar
*.class
.idea/
*.iml
.vscode/
.DS_Store
*.log
~/.gitcontrib/
`
  );

  // Add mvnw runner script note
  projectFolder.file(
    'BUILD.txt',
    `GitContrib CLI Maven Project
=============================

Pre-requisites:
- JDK 17 or later (OpenJDK, GraalVM, Temurin)
- Apache Maven 3.8+

Quick Start:
1. Build executable fat JAR:
   mvn clean package

2. Test run:
   java -jar target/gitcontrib-cli-1.0.0.jar --help

3. Build GraalVM native binary:
   mvn package -Pnative
   ./target/gitcontrib --help
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gitcontrib-cli-maven-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
