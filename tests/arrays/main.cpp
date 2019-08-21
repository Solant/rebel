#include <fstream>
#include <iostream>
#include <string>
#include <ctime>

int main(int argc, char **argv) {
    std::string fileName(argv[1]);
    std::string mode(argv[2]);

    if (mode == "write") {
        std::ofstream file(fileName, std::ios::out | std::ios::binary);
        int32_t size = std::stoi(argv[3]);

        file.write((char*) &size, sizeof size);
        std::srand(unsigned(std::time(0)));
        for (int i = 0; i < size; i++) {
            int32_t random = std::rand();
            file.write((char*) &random, sizeof random);
        }
        file.close();
    }

    if (mode == "read") {
        std::ifstream file(fileName, std::ios::in | std::ios::binary);

        int32_t size;
        file.read((char*)&size, sizeof size);
        std::cout << std::to_string(size) << std::endl;
        for (int i = 0; i < size; i++) {
            int32_t tmp = 0;
            file.read((char*)&tmp, sizeof tmp);
            std::cout << std::to_string(tmp) << std::endl;
        }

        file.close();
    }
}
