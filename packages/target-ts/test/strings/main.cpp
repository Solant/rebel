#include <fstream>
#include <iostream>
#include <string>
#include <ctime>

int main(int argc, char **argv) {
    std::string fileName(argv[1]);
    std::string mode(argv[2]);

    if (mode == "write") {
        std::ofstream file(fileName, std::ios::out | std::ios::binary);

        int size = 10;
        char data[] = "helloworld";
        file.write(data, size);

        file.close();
    }

    if (mode == "read") {
        std::ifstream file(fileName, std::ios::in | std::ios::binary);

        char *data = new char[10];
        file.read(data, 10);
        std::cout << data << std::endl;

        file.close();
    }
}
