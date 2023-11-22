FROM golang:1.19.6-bullseye
RUN apt update
RUN apt install dnsutils iputils-ping telnet unzip git awscli ssh -y
WORKDIR /tmp
RUN wget https://github.com/aws/aws-sam-cli/releases/download/v1.73.0/aws-sam-cli-linux-x86_64.zip
RUN unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
RUN sam-installation/install && sam --version
RUN rm -rf communication-sam-cli-linux-x86_64.zip
RUN rm -rf sam-installation
WORKDIR /app

