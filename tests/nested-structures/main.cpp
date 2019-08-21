#include <fstream>
#include <iostream>
#include <string>

int main(int argc, char **argv) {
    if (argc != 2) {
        return 1;
    }

	int8_t a = -23;
	uint8_t b = 23;
	int32_t c = -2147483;
	uint32_t d = 2147483;


    std::string mode(argv[1]);
    if (mode == "write") {
        std::ofstream file("test.bin", std::ios::out | std::ios::binary);
        file.write((char*) &a, sizeof a);
        file.write((char*) &b, sizeof b);
        file.write((char*) &c, sizeof c);
        file.write((char*) &d, sizeof d);
        file.close();
    }

    if (mode == "read") {
        std::ifstream file("test.bin", std::ios::in | std::ios::binary);
        file.read((char*)&a, sizeof a);
        file.read((char*)&b, sizeof b);
        file.read((char*)&c, sizeof c);
        file.read((char*)&d, sizeof d);
        file.close();
        std::cout << std::to_string(a) << std::endl
            << std::to_string(b) << std::endl
            << std::to_string(c) << std::endl
            << std::to_string(d) << std::endl;
    }
}
