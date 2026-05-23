namespace Domain.Exceptions;

public class DuplicateProxyException(string ip, int port)
    : Exception($"Proxy {ip}:{port} already exists.");
