#include <fstream>
#include <iostream>

int main(int argc, char **argv) {
    if (argc != 2) {
        return 1;
    }

	int32_t a = 23;

    std::string mode(argv[1]);
    if (mode == "write") {
        std::ofstream file("test.bin", std::ios::out | std::ios::binary);
        file.write((char*) &a, sizeof(int32_t));
        file.write((char*) &a, sizeof(int32_t));
        file.close();
    }

    if (mode == "read") {
        std::ifstream file("test.bin", std::ios::in | std::ios::binary);
        int32_t b = 0;
        int32_t c = 0;
        file.read((char*)&b, sizeof(int32_t));
        file.read((char*)&c, sizeof(int32_t));
        file.close();
        std::cout << b << std::endl << c <<std::endl;
    }
}
