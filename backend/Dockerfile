FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install --no-install-recommends -y python3-pip libgl1-mesa-glx libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir /usr/local/share/metaanchor-backend
WORKDIR /usr/local/share/metaanchor-backend

# dependency layer
ADD requirements.txt ./
RUN pip3 install -r requirements.txt

# source layer
# XXX: this is a good bit longer than usual for wrestling avutils into the container
ADD app.py ./
ADD src ./src

RUN groupadd -g 1000 metaanchor && useradd -u 1000 -g 1000 -d /nonexistent -M metaanchor
USER metaanchor:metaanchor

EXPOSE 8080
ENTRYPOINT ["python3", "app.py"]
